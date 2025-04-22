const crypto = require('crypto');
const Pipeline = require('../models/pipeline.model');
const Build = require('../models/build.model');
const { processBuildEvent } = require('../services/build.service');
const { emitBuildEvent } = require('../websockets/events');

/**
 * Verify GitHub webhook signature
 */
exports.verifyGithubWebhook = (req, res, buf, encoding) => {
  if (req.headers['x-hub-signature-256']) {
    const signature = req.headers['x-hub-signature-256'];
    const hmac = crypto.createHmac('sha256', req.pipeline?.webhookSecret || '');
    const digest = 'sha256=' + hmac.update(buf).digest('hex');
    
    req.githubVerified = signature === digest;
  } else {
    req.githubVerified = false;
  }
};

/**
 * Handle GitHub webhook events
 */
exports.handleGithubWebhook = async (req, res, next) => {
  try {
    const event = req.headers['x-github-event'];
    const delivery = req.headers['x-github-delivery'];
    const payload = req.body;

    // Log webhook receipt
    console.log(`Received GitHub webhook: ${event}, delivery: ${delivery}`);

    // Find pipeline by repository URL
    let repositoryUrl = '';
    if (payload.repository) {
      repositoryUrl = payload.repository.html_url;
    }

    if (!repositoryUrl) {
      return res.status(400).json({
        success: false,
        message: 'Repository URL not found in webhook payload'
      });
    }

    const pipeline = await Pipeline.findOne({
      provider: 'github',
      repositoryUrl,
      isActive: true
    }).select('+webhookSecret');

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found for this repository'
      });
    }

    // Store pipeline in request for signature verification
    req.pipeline = pipeline;

    // Verify webhook signature
    if (!req.githubVerified) {
      console.warn(`Invalid GitHub webhook signature for pipeline ${pipeline._id}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Process different event types
    let result = { success: false, message: 'Unsupported event type' };

    switch (event) {
      case 'push':
        result = await handleGithubPushEvent(pipeline, payload);
        break;
      case 'pull_request':
        result = await handleGithubPullRequestEvent(pipeline, payload);
        break;
      case 'workflow_job':
      case 'workflow_run':
        result = await handleGithubWorkflowEvent(pipeline, payload);
        break;
      case 'check_run':
        result = await handleGithubCheckRunEvent(pipeline, payload);
        break;
      default:
        // Acknowledge receipt but don't process
        return res.status(202).json({
          success: true,
          message: `Event type ${event} acknowledged but not processed`
        });
    }

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error processing GitHub webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
};

/**
 * Handle GitHub push event
 */
const handleGithubPushEvent = async (pipeline, payload) => {
  try {
    const branch = payload.ref.replace('refs/heads/', '');
    
    // Check if this is for the branch we're monitoring
    if (branch !== pipeline.branch) {
      return {
        success: true,
        message: `Event for branch ${branch} ignored, monitoring ${pipeline.branch}`
      };
    }

    const headCommit = payload.head_commit;
    if (!headCommit) {
      return {
        success: false,
        message: 'No head commit found in payload'
      };
    }

    // Create or update build
    const buildData = {
      pipeline: pipeline._id,
      provider: 'github',
      providerBuildId: payload.after,
      status: 'pending',
      commit: {
        sha: payload.after,
        message: headCommit.message,
        author: {
          name: headCommit.author.name,
          email: headCommit.author.email
        },
        url: headCommit.url,
        branch
      },
      startedAt: new Date()
    };

    // Process build event
    const result = await processBuildEvent(pipeline, buildData);

    return {
      success: true,
      message: 'GitHub push event processed successfully',
      build: result.build
    };
  } catch (error) {
    console.error('Error handling GitHub push event:', error);
    return {
      success: false,
      message: 'Error handling GitHub push event',
      error: error.message
    };
  }
};

/**
 * Handle GitHub pull request event
 */
const handleGithubPullRequestEvent = async (pipeline, payload) => {
  try {
    const action = payload.action;
    
    // Only process opened, reopened, or synchronized PRs
    if (!['opened', 'reopened', 'synchronize'].includes(action)) {
      return {
        success: true,
        message: `Pull request action ${action} ignored`
      };
    }

    const pullRequest = payload.pull_request;
    const baseBranch = pullRequest.base.ref;
    
    // Check if this PR targets the branch we're monitoring
    if (baseBranch !== pipeline.branch) {
      return {
        success: true,
        message: `PR for base branch ${baseBranch} ignored, monitoring ${pipeline.branch}`
      };
    }

    // Create or update build
    const buildData = {
      pipeline: pipeline._id,
      provider: 'github',
      providerBuildId: `pr-${pullRequest.number}`,
      status: 'pending',
      commit: {
        sha: pullRequest.head.sha,
        message: `PR #${pullRequest.number}: ${pullRequest.title}`,
        author: {
          name: pullRequest.user.login,
          email: '',
          avatar: pullRequest.user.avatar_url
        },
        url: pullRequest.html_url,
        branch: pullRequest.head.ref
      },
      startedAt: new Date()
    };

    // Process build event
    const result = await processBuildEvent(pipeline, buildData);

    return {
      success: true,
      message: 'GitHub pull request event processed successfully',
      build: result.build
    };
  } catch (error) {
    console.error('Error handling GitHub pull request event:', error);
    return {
      success: false,
      message: 'Error handling GitHub pull request event',
      error: error.message
    };
  }
};

/**
 * Handle GitHub workflow event
 */
const handleGithubWorkflowEvent = async (pipeline, payload) => {
  try {
    const action = payload.action;
    const workflow = payload.workflow_run || payload.workflow_job;
    
    if (!workflow) {
      return {
        success: false,
        message: 'No workflow data found in payload'
      };
    }

    // Find build by commit SHA
    const commitSha = workflow.head_sha;
    let build = await Build.findOne({
      pipeline: pipeline._id,
      'commit.sha': commitSha
    });

    if (!build) {
      // Create new build if not found
      build = new Build({
        pipeline: pipeline._id,
        buildNumber: await getNextBuildNumber(pipeline._id),
        provider: 'github',
        providerBuildId: workflow.id.toString(),
        providerBuildUrl: workflow.html_url,
        status: mapGithubWorkflowStatus(workflow.status, workflow.conclusion),
        startedAt: workflow.started_at ? new Date(workflow.started_at) : new Date(),
        commit: {
          sha: commitSha,
          message: workflow.head_commit?.message || `Workflow ${workflow.name}`,
          author: {
            name: workflow.head_commit?.author?.name || 'Unknown',
            email: workflow.head_commit?.author?.email || ''
          },
          url: workflow.html_url,
          branch: workflow.head_branch
        }
      });
    } else {
      // Update existing build
      build.status = mapGithubWorkflowStatus(workflow.status, workflow.conclusion);
      build.providerBuildUrl = workflow.html_url;
      
      if (workflow.started_at) {
        build.startedAt = new Date(workflow.started_at);
      }
      
      if (workflow.completed_at && ['completed', 'success', 'failure', 'cancelled'].includes(workflow.status)) {
        build.finishedAt = new Date(workflow.completed_at);
        build.duration = Math.floor((build.finishedAt - build.startedAt) / 1000);
      }
    }

    await build.save();

    // Update pipeline last build
    await updatePipelineLastBuild(pipeline._id, build);

    // Emit build event
    emitBuildEvent('build:updated', {
      buildId: build._id,
      pipelineId: pipeline._id,
      organizationId: pipeline.organization,
      status: build.status
    });

    return {
      success: true,
      message: 'GitHub workflow event processed successfully',
      build
    };
  } catch (error) {
    console.error('Error handling GitHub workflow event:', error);
    return {
      success: false,
      message: 'Error handling GitHub workflow event',
      error: error.message
    };
  }
};

/**
 * Handle GitHub check run event
 */
const handleGithubCheckRunEvent = async (pipeline, payload) => {
  try {
    const action = payload.action;
    const checkRun = payload.check_run;
    
    if (!checkRun) {
      return {
        success: false,
        message: 'No check run data found in payload'
      };
    }

    // Only process completed check runs
    if (action !== 'completed') {
      return {
        success: true,
        message: `Check run action ${action} ignored`
      };
    }

    // Find build by commit SHA
    const commitSha = checkRun.head_sha;
    const build = await Build.findOne({
      pipeline: pipeline._id,
      'commit.sha': commitSha
    });

    if (!build) {
      return {
        success: false,
        message: 'No build found for this check run'
      };
    }

    // Update build status based on check run conclusion
    if (checkRun.conclusion === 'success') {
      build.status = 'success';
    } else if (['failure', 'cancelled', 'timed_out', 'action_required'].includes(checkRun.conclusion)) {
      build.status = 'failure';
    }

    build.finishedAt = new Date(checkRun.completed_at);
    build.duration = Math.floor((build.finishedAt - build.startedAt) / 1000);
    
    await build.save();

    // Update pipeline last build
    await updatePipelineLastBuild(pipeline._id, build);

    // Emit build event
    emitBuildEvent('build:updated', {
      buildId: build._id,
      pipelineId: pipeline._id,
      organizationId: pipeline.organization,
      status: build.status
    });

    return {
      success: true,
      message: 'GitHub check run event processed successfully',
      build
    };
  } catch (error) {
    console.error('Error handling GitHub check run event:', error);
    return {
      success: false,
      message: 'Error handling GitHub check run event',
      error: error.message
    };
  }
};

/**
 * Handle GitLab webhook events
 */
exports.handleGitlabWebhook = async (req, res, next) => {
  try {
    const event = req.headers['x-gitlab-event'];
    const token = req.headers['x-gitlab-token'];
    const payload = req.body;

    // Log webhook receipt
    console.log(`Received GitLab webhook: ${event}`);

    // Find pipeline by repository URL
    let repositoryUrl = '';
    if (payload.project) {
      repositoryUrl = payload.project.web_url;
    } else if (payload.repository) {
      repositoryUrl = payload.repository.homepage;
    }

    if (!repositoryUrl) {
      return res.status(400).json({
        success: false,
        message: 'Repository URL not found in webhook payload'
      });
    }

    const pipeline = await Pipeline.findOne({
      provider: 'gitlab',
      repositoryUrl,
      isActive: true
    }).select('+webhookSecret');

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found for this repository'
      });
    }

    // Verify webhook token
    if (pipeline.webhookSecret && pipeline.webhookSecret !== token) {
      console.warn(`Invalid GitLab webhook token for pipeline ${pipeline._id}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook token'
      });
    }

    // Process different event types
    let result = { success: false, message: 'Unsupported event type' };

    switch (event) {
      case 'Push Hook':
        result = await handleGitlabPushEvent(pipeline, payload);
        break;
      case 'Merge Request Hook':
        result = await handleGitlabMergeRequestEvent(pipeline, payload);
        break;
      case 'Pipeline Hook':
        result = await handleGitlabPipelineEvent(pipeline, payload);
        break;
      case 'Job Hook':
        result = await handleGitlabJobEvent(pipeline, payload);
        break;
      default:
        // Acknowledge receipt but don't process
        return res.status(202).json({
          success: true,
          message: `Event type ${event} acknowledged but not processed`
        });
    }

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error processing GitLab webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
};

/**
 * Handle Jenkins webhook events
 */
exports.handleJenkinsWebhook = async (req, res, next) => {
  try {
    const payload = req.body;

    // Log webhook receipt
    console.log('Received Jenkins webhook');

    // Extract pipeline ID from URL parameters or headers
    const pipelineId = req.query.pipelineId || req.headers['x-pipeline-id'];
    
    if (!pipelineId) {
      return res.status(400).json({
        success: false,
        message: 'Pipeline ID not provided in webhook URL or headers'
      });
    }

    const pipeline = await Pipeline.findOne({
      _id: pipelineId,
      provider: 'jenkins',
      isActive: true
    }).select('+webhookSecret');

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Verify webhook token if configured
    const token = req.headers['x-jenkins-token'];
    if (pipeline.webhookSecret && pipeline.webhookSecret !== token) {
      console.warn(`Invalid Jenkins webhook token for pipeline ${pipeline._id}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook token'
      });
    }

    // Process Jenkins build event
    const result = await handleJenkinsBuildEvent(pipeline, payload);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error processing Jenkins webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
};

/**
 * Handle CircleCI webhook events
 */
exports.handleCircleCIWebhook = async (req, res, next) => {
  try {
    const payload = req.body;
    const signature = req.headers['circleci-signature'];

    // Log webhook receipt
    console.log('Received CircleCI webhook');

    // Extract pipeline ID from URL parameters or headers
    const pipelineId = req.query.pipelineId || req.headers['x-pipeline-id'];
    
    if (!pipelineId) {
      return res.status(400).json({
        success: false,
        message: 'Pipeline ID not provided in webhook URL or headers'
      });
    }

    const pipeline = await Pipeline.findOne({
      _id: pipelineId,
      provider: 'circleci',
      isActive: true
    }).select('+webhookSecret');

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Verify webhook signature if configured
    if (pipeline.webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', pipeline.webhookSecret);
      const digest = hmac.update(JSON.stringify(payload)).digest('hex');
      
      if (signature !== digest) {
        console.warn(`Invalid CircleCI webhook signature for pipeline ${pipeline._id}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
    }

    // Process CircleCI build event
    const result = await handleCircleCIBuildEvent(pipeline, payload);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error processing CircleCI webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
};

/**
 * Handle generic webhook for custom integrations
 */
exports.handleGenericWebhook = async (req, res, next) => {
  try {
    const { pipelineId } = req.params;
    const payload = req.body;

    // Log webhook receipt
    console.log(`Received generic webhook for pipeline ${pipelineId}`);

    const pipeline = await Pipeline.findOne({
      _id: pipelineId,
      isActive: true
    }).select('+webhookSecret');

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Verify webhook token if configured
    const token = req.headers['x-webhook-token'];
    if (pipeline.webhookSecret && pipeline.webhookSecret !== token) {
      console.warn(`Invalid generic webhook token for pipeline ${pipeline._id}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook token'
      });
    }

    // Process generic build event
    const result = await handleGenericBuildEvent(pipeline, payload);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error processing generic webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
};

/**
 * Get next build number for a pipeline
 */
const getNextBuildNumber = async (pipelineId) => {
  const lastBuild = await Build.findOne({ pipeline: pipelineId })
    .sort({ buildNumber: -1 })
    .limit(1);

  return lastBuild ? lastBuild.buildNumber + 1 : 1;
};

/**
 * Update pipeline's last build information
 */
const updatePipelineLastBuild = async (pipelineId, build) => {
  const pipeline = await Pipeline.findById(pipelineId);
  
  if (!pipeline) {
    throw new Error(`Pipeline ${pipelineId} not found`);
  }

  // Only update if this is a newer build or there's no last build
  if (!pipeline.lastBuild || pipeline.lastBuild.buildNumber <= build.buildNumber) {
    pipeline.lastBuild = {
      buildNumber: build.buildNumber,
      status: build.status,
      startedAt: build.startedAt,
      finishedAt: build.finishedAt,
      duration: build.duration,
      commitSha: build.commit.sha,
      commitMessage: build.commit.message,
      commitAuthor: build.commit.author.name,
      url: build.providerBuildUrl
    };
    
    await pipeline.save();
  }
};

/**
 * Map GitHub workflow status to our build status
 */
const mapGithubWorkflowStatus = (status, conclusion) => {
  if (status === 'completed') {
    switch (conclusion) {
      case 'success':
        return 'success';
      case 'failure':
      case 'timed_out':
      case 'action_required':
        return 'failure';
      case 'cancelled':
        return 'canceled';
      default:
        return 'unknown';
    }
  } else if (status === 'in_progress') {
    return 'running';
  } else if (status === 'queued') {
    return 'pending';
  }
  
  return 'unknown';
};
