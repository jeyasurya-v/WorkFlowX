const Build = require('../models/build.model');
const Pipeline = require('../models/pipeline.model');
const Notification = require('../models/notification.model');
const { validatePipelineAccess } = require('../services/authorization.service');
const { createNotification } = require('../services/notification.service');
const { emitBuildEvent } = require('../websockets/events');

/**
 * Get builds for a pipeline
 */
exports.getPipelineBuilds = async (req, res, next) => {
  try {
    const { pipelineId } = req.params;
    const { status, branch, page = 1, limit = 20, sort = 'buildNumber', order = 'desc' } = req.query;

    // Check if pipeline exists
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Check if user has access to pipeline
    const hasAccess = await validatePipelineAccess(req.user.id, pipeline);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this pipeline'
      });
    }

    // Build query
    const query = { pipeline: pipelineId };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add branch filter if provided
    if (branch) {
      query['commit.branch'] = branch;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sort] = sortOrder;

    // Get builds
    const builds = await Build.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('triggeredBy', 'firstName lastName email avatar');

    // Get total count for pagination
    const totalCount = await Build.countDocuments(query);

    res.status(200).json({
      success: true,
      builds,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get build by ID
 */
exports.getBuild = async (req, res, next) => {
  try {
    const { buildId } = req.params;

    // Get build with pipeline info
    const build = await Build.findById(buildId)
      .populate('pipeline', 'name provider repositoryUrl branch')
      .populate('triggeredBy', 'firstName lastName email avatar');

    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    // Check if user has access to the pipeline
    const hasAccess = await validatePipelineAccess(req.user.id, build.pipeline);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this build'
      });
    }

    res.status(200).json({
      success: true,
      build
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get build logs
 */
exports.getBuildLogs = async (req, res, next) => {
  try {
    const { buildId } = req.params;

    // Get build with logs
    const build = await Build.findById(buildId).select('+logs');

    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    // Check if user has access to the pipeline
    const hasAccess = await validatePipelineAccess(req.user.id, build.pipeline);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this build'
      });
    }

    res.status(200).json({
      success: true,
      logs: build.logs || 'No logs available'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retry a build
 */
exports.retryBuild = async (req, res, next) => {
  try {
    const { buildId } = req.params;

    // Get original build
    const originalBuild = await Build.findById(buildId);
    if (!originalBuild) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    // Check if user has permission to retry build
    const pipeline = await Pipeline.findById(originalBuild.pipeline);
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Check if user has access to the pipeline
    const hasAccess = await validatePipelineAccess(req.user.id, pipeline);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this pipeline'
      });
    }

    // Get pipeline credentials
    const pipelineWithCredentials = await Pipeline.findById(pipeline._id).select('+credentials');
    const credentials = pipelineWithCredentials.credentials;

    // Trigger build using appropriate provider service
    const providerService = require(`../services/providers/${pipeline.provider}.service`);
    const buildData = await providerService.triggerBuild(pipeline, credentials, {
      branch: originalBuild.commit.branch,
      commitSha: originalBuild.commit.sha,
      triggeredBy: req.user.id,
      isRetry: true,
      originalBuild: originalBuild._id,
      retryCount: originalBuild.retryCount + 1
    });

    res.status(200).json({
      success: true,
      message: 'Build retry triggered successfully',
      build: buildData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a build
 */
exports.cancelBuild = async (req, res, next) => {
  try {
    const { buildId } = req.params;

    // Get build
    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    // Check if build is in a cancelable state
    if (!['pending', 'running'].includes(build.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel build with status: ${build.status}`
      });
    }

    // Check if user has permission to cancel build
    const pipeline = await Pipeline.findById(build.pipeline);
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Check if user has access to the pipeline
    const hasAccess = await validatePipelineAccess(req.user.id, pipeline);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this pipeline'
      });
    }

    // Get pipeline credentials
    const pipelineWithCredentials = await Pipeline.findById(pipeline._id).select('+credentials');
    const credentials = pipelineWithCredentials.credentials;

    // Cancel build using appropriate provider service
    const providerService = require(`../services/providers/${pipeline.provider}.service`);
    const cancelResult = await providerService.cancelBuild(pipeline, credentials, build);

    if (cancelResult.success) {
      // Update build status
      build.status = 'canceled';
      build.finishedAt = new Date();
      if (build.startedAt) {
        build.duration = Math.floor((build.finishedAt - build.startedAt) / 1000);
      }
      await build.save();

      // Update pipeline last build if this was the last build
      if (pipeline.lastBuild && pipeline.lastBuild.buildNumber === build.buildNumber) {
        pipeline.lastBuild.status = 'canceled';
        pipeline.lastBuild.finishedAt = build.finishedAt;
        pipeline.lastBuild.duration = build.duration;
        await pipeline.save();
      }

      // Emit build update event
      emitBuildEvent('build:updated', {
        buildId: build._id,
        pipelineId: pipeline._id,
        organizationId: pipeline.organization,
        status: 'canceled'
      });

      // Create notification
      await createNotification({
        title: `Build #${build.buildNumber} canceled`,
        message: `Build #${build.buildNumber} for pipeline ${pipeline.name} was canceled by ${req.user.firstName} ${req.user.lastName}`,
        type: 'build',
        severity: 'info',
        organization: pipeline.organization,
        pipeline: pipeline._id,
        build: build._id,
        recipients: [], // Will be determined by notification service
        channels: ['in-app'], // Default channel
        data: {
          buildNumber: build.buildNumber,
          pipelineName: pipeline.name,
          canceledBy: {
            id: req.user.id,
            name: `${req.user.firstName} ${req.user.lastName}`
          }
        }
      });

      res.status(200).json({
        success: true,
        message: 'Build canceled successfully',
        build: {
          id: build._id,
          status: build.status,
          finishedAt: build.finishedAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: cancelResult.message || 'Failed to cancel build'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Add comment to a build
 */
exports.addBuildComment = async (req, res, next) => {
  try {
    const { buildId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Comment message is required'
      });
    }

    // Get build
    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }

    // Check if user has access to the pipeline
    const hasAccess = await validatePipelineAccess(req.user.id, build.pipeline);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this build'
      });
    }

    // Add comment
    build.comments.push({
      user: req.user.id,
      message,
      createdAt: new Date()
    });

    await build.save();

    // Get updated build with populated comments
    const updatedBuild = await Build.findById(buildId)
      .populate('comments.user', 'firstName lastName email avatar');

    // Emit build comment event
    emitBuildEvent('build:comment', {
      buildId: build._id,
      pipelineId: build.pipeline,
      comment: {
        user: {
          id: req.user.id,
          name: `${req.user.firstName} ${req.user.lastName}`,
          avatar: req.user.avatar
        },
        message,
        createdAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      comments: updatedBuild.comments
    });
  } catch (error) {
    next(error);
  }
};
