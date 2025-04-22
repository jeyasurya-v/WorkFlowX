const Build = require('../models/build.model');
const Pipeline = require('../models/pipeline.model');
const { emitBuildEvent } = require('../websockets/events');
const { createNotification } = require('./notification.service');

/**
 * Process a build event from a CI/CD provider
 * @param {Object} pipeline - Pipeline document
 * @param {Object} buildData - Build data from webhook
 * @returns {Object} - Processed build
 */
exports.processBuildEvent = async (pipeline, buildData) => {
  try {
    // Find existing build or create new one
    let build;
    
    if (buildData.providerBuildId) {
      // Try to find by provider build ID
      build = await Build.findOne({
        pipeline: pipeline._id,
        providerBuildId: buildData.providerBuildId
      });
    }
    
    if (!build && buildData.commit?.sha) {
      // Try to find by commit SHA
      build = await Build.findOne({
        pipeline: pipeline._id,
        'commit.sha': buildData.commit.sha
      });
    }
    
    if (!build) {
      // Create new build
      const buildNumber = await getNextBuildNumber(pipeline._id);
      
      build = new Build({
        pipeline: pipeline._id,
        buildNumber,
        provider: pipeline.provider,
        ...buildData
      });
    } else {
      // Update existing build
      Object.keys(buildData).forEach(key => {
        if (key !== '_id' && key !== 'pipeline' && key !== 'buildNumber') {
          build[key] = buildData[key];
        }
      });
    }
    
    // Save build
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
    
    // Create notification if build status is final
    if (['success', 'failure', 'canceled'].includes(build.status)) {
      await createBuildNotification(pipeline, build);
    }
    
    return { success: true, build };
  } catch (error) {
    console.error('Error processing build event:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get next build number for a pipeline
 * @param {string} pipelineId - Pipeline ID
 * @returns {number} - Next build number
 */
const getNextBuildNumber = async (pipelineId) => {
  const lastBuild = await Build.findOne({ pipeline: pipelineId })
    .sort({ buildNumber: -1 })
    .limit(1);
    
  return lastBuild ? lastBuild.buildNumber + 1 : 1;
};

/**
 * Update pipeline's last build information
 * @param {string} pipelineId - Pipeline ID
 * @param {Object} build - Build document
 */
const updatePipelineLastBuild = async (pipelineId, build) => {
  try {
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
        commitSha: build.commit?.sha,
        commitMessage: build.commit?.message,
        commitAuthor: build.commit?.author?.name,
        url: build.providerBuildUrl
      };
      
      await pipeline.save();
    }
  } catch (error) {
    console.error('Error updating pipeline last build:', error);
    throw error;
  }
};

/**
 * Create notification for build status
 * @param {Object} pipeline - Pipeline document
 * @param {Object} build - Build document
 */
const createBuildNotification = async (pipeline, build) => {
  try {
    // Determine notification severity based on build status
    const severity = build.status === 'success' ? 'success' : 'error';
    
    // Check pipeline config to see if we should notify for this status
    if (build.status === 'success' && !pipeline.config?.notifyOnSuccess) {
      return;
    }
    
    if (build.status === 'failure' && !pipeline.config?.notifyOnFailure) {
      return;
    }
    
    // Create notification title and message
    const title = `Build #${build.buildNumber} ${build.status}`;
    let message = `Build #${build.buildNumber} for pipeline "${pipeline.name}" ${build.status}`;
    
    if (build.commit) {
      message += `\nCommit: ${build.commit.message}`;
      if (build.commit.author?.name) {
        message += ` by ${build.commit.author.name}`;
      }
    }
    
    // Create notification
    await createNotification({
      title,
      message,
      type: 'build',
      severity,
      organization: pipeline.organization,
      pipeline: pipeline._id,
      build: build._id,
      data: {
        buildNumber: build.buildNumber,
        pipelineName: pipeline.name,
        status: build.status,
        commitSha: build.commit?.sha,
        commitMessage: build.commit?.message,
        duration: build.duration
      }
    });
  } catch (error) {
    console.error('Error creating build notification:', error);
    // Don't throw error to prevent build processing from failing
  }
};

/**
 * Get build statistics for a pipeline
 * @param {string} pipelineId - Pipeline ID
 * @param {Object} options - Query options
 * @returns {Object} - Build statistics
 */
exports.getBuildStatistics = async (pipelineId, options = {}) => {
  try {
    const { startDate, endDate, branch } = options;
    
    // Build query
    const query = { pipeline: pipelineId };
    
    // Add date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Add branch filter if provided
    if (branch) {
      query['commit.branch'] = branch;
    }
    
    // Get build counts by status
    const statusCounts = await Build.aggregate([
      { $match: query },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);
    
    // Get average build duration
    const durationStats = await Build.aggregate([
      { $match: { ...query, status: 'success', duration: { $exists: true, $ne: null } } },
      { $group: {
        _id: null,
        avgDuration: { $avg: '$duration' },
        minDuration: { $min: '$duration' },
        maxDuration: { $max: '$duration' }
      }}
    ]);
    
    // Get build frequency over time
    const timeSeriesData = await Build.aggregate([
      { $match: query },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
        }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Format status counts
    const formattedStatusCounts = {
      success: 0,
      failure: 0,
      running: 0,
      pending: 0,
      canceled: 0,
      unknown: 0
    };
    
    statusCounts.forEach(item => {
      formattedStatusCounts[item._id] = item.count;
    });
    
    // Calculate success rate
    const totalBuilds = Object.values(formattedStatusCounts).reduce((sum, count) => sum + count, 0);
    const successRate = totalBuilds > 0 
      ? (formattedStatusCounts.success / totalBuilds) * 100 
      : 0;
    
    return {
      totalBuilds,
      statusCounts: formattedStatusCounts,
      successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
      duration: durationStats.length > 0 ? {
        avg: Math.round(durationStats[0].avgDuration),
        min: durationStats[0].minDuration,
        max: durationStats[0].maxDuration
      } : null,
      timeSeries: timeSeriesData.map(item => ({
        date: item._id,
        total: item.count,
        success: item.successCount,
        failure: item.failureCount
      }))
    };
  } catch (error) {
    console.error('Error getting build statistics:', error);
    throw error;
  }
};
