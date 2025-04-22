/**
 * Integration Service
 * 
 * Handles interactions with various CI/CD providers.
 * Provides functionality to connect, fetch data, and process webhooks.
 */

const Integration = require('../models/integration.model');
const Pipeline = require('../models/pipeline.model');
const Build = require('../models/build.model');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

// Provider-specific clients
const githubProvider = require('./providers/github.provider');
const gitlabProvider = require('./providers/gitlab.provider');
const jenkinsProvider = require('./providers/jenkins.provider');
const circleciProvider = require('./providers/circleci.provider');

/**
 * Get provider client based on provider type
 * @param {string} provider - Provider type
 * @param {Object} config - Provider configuration
 * @returns {Object} Provider client
 */
const getProviderClient = (provider, config = {}) => {
  switch (provider) {
    case 'github':
      return githubProvider;
    case 'gitlab':
      return gitlabProvider;
    case 'jenkins':
      return jenkinsProvider;
    case 'circleci':
      return circleciProvider;
    default:
      throw new ApiError(`Unsupported provider: ${provider}`, 400);
  }
};

/**
 * Create a new integration
 * @param {Object} integrationData - Integration data
 * @param {string} userId - User creating the integration
 * @returns {Promise<Object>} Created integration
 */
exports.createIntegration = async (integrationData, userId) => {
  logger.info('Creating new integration', { provider: integrationData.provider });
  
  try {
    // Validate credentials with provider
    const provider = getProviderClient(integrationData.provider);
    
    // Test connection with the provider
    const validCredentials = await provider.validateCredentials({
      ...integrationData.config,
      apiToken: integrationData.apiToken
    });
    
    if (!validCredentials) {
      logger.warn('Invalid credentials for integration', { provider: integrationData.provider });
      throw new ApiError('Failed to validate credentials with provider', 400);
    }
    
    // Create integration record
    const integration = new Integration({
      ...integrationData,
      createdBy: userId,
      status: 'active'
    });
    
    // Generate webhook URL if provider supports webhooks
    if (provider.supportsWebhooks) {
      integration.webhookUrl = `/api/v1/webhooks/${integration.provider}/${integration._id}`;
      integration.webhookSecret = Math.random().toString(36).substring(2, 15);
    }
    
    await integration.save();
    logger.info('Integration created successfully', { integrationId: integration._id });
    
    // Schedule initial sync
    await this.syncIntegration(integration._id);
    
    return integration;
  } catch (error) {
    logger.error('Error creating integration', { 
      error: error.message, 
      provider: integrationData.provider 
    });
    throw error;
  }
};

/**
 * Get integration by ID
 * @param {string} integrationId - Integration ID
 * @param {string} organizationId - Organization ID for access control
 * @returns {Promise<Object>} Integration
 */
exports.getIntegration = async (integrationId, organizationId) => {
  try {
    const integration = await Integration.findOne({
      _id: integrationId,
      organization: organizationId
    });
    
    if (!integration) {
      throw new ApiError('Integration not found', 404);
    }
    
    return integration;
  } catch (error) {
    logger.error('Error retrieving integration', { 
      error: error.message, 
      integrationId 
    });
    throw error;
  }
};

/**
 * Update integration
 * @param {string} integrationId - Integration ID
 * @param {Object} updates - Update data
 * @param {string} organizationId - Organization ID for access control
 * @returns {Promise<Object>} Updated integration
 */
exports.updateIntegration = async (integrationId, updates, organizationId) => {
  try {
    const integration = await Integration.findOne({
      _id: integrationId,
      organization: organizationId
    });
    
    if (!integration) {
      throw new ApiError('Integration not found', 404);
    }
    
    // Update fields
    const allowedUpdates = ['name', 'config', 'apiToken', 'settings', 'status'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        integration[field] = updates[field];
      }
    });
    
    // If token was updated, validate with provider
    if (updates.apiToken) {
      const provider = getProviderClient(integration.provider);
      const validCredentials = await provider.validateCredentials({
        ...integration.config,
        apiToken: integration.apiToken
      });
      
      if (!validCredentials) {
        throw new ApiError('Failed to validate credentials with provider', 400);
      }
    }
    
    await integration.save();
    logger.info('Integration updated successfully', { integrationId });
    
    return integration;
  } catch (error) {
    logger.error('Error updating integration', { 
      error: error.message, 
      integrationId 
    });
    throw error;
  }
};

/**
 * Delete integration
 * @param {string} integrationId - Integration ID
 * @param {string} organizationId - Organization ID for access control
 * @returns {Promise<boolean>} Success status
 */
exports.deleteIntegration = async (integrationId, organizationId) => {
  try {
    // Check if integration exists and belongs to organization
    const integration = await Integration.findOne({
      _id: integrationId,
      organization: organizationId
    });
    
    if (!integration) {
      throw new ApiError('Integration not found', 404);
    }
    
    // Check if there are pipelines using this integration
    const pipelineCount = await Pipeline.countDocuments({ integration: integrationId });
    
    if (pipelineCount > 0) {
      throw new ApiError(
        `Cannot delete integration with ${pipelineCount} active pipelines. Please delete or reassign pipelines first.`, 
        400
      );
    }
    
    await Integration.deleteOne({ _id: integrationId });
    logger.info('Integration deleted successfully', { integrationId });
    
    return true;
  } catch (error) {
    logger.error('Error deleting integration', { 
      error: error.message, 
      integrationId 
    });
    throw error;
  }
};

/**
 * Sync integration with provider to update pipelines and builds
 * @param {string} integrationId - Integration ID
 * @returns {Promise<Object>} Sync results
 */
exports.syncIntegration = async (integrationId) => {
  logger.info('Starting integration sync', { integrationId });
  
  try {
    const integration = await Integration.findById(integrationId);
    
    if (!integration) {
      throw new ApiError('Integration not found', 404);
    }
    
    if (integration.status !== 'active') {
      logger.warn('Cannot sync inactive integration', { integrationId });
      throw new ApiError('Cannot sync inactive integration', 400);
    }
    
    // Get provider client
    const provider = getProviderClient(integration.provider);
    
    // Fetch pipelines from provider
    const providerPipelines = await provider.fetchPipelines({
      ...integration.config,
      apiToken: integration.apiToken
    });
    
    // Process results
    const results = {
      pipelinesCreated: 0,
      pipelinesUpdated: 0,
      buildsCreated: 0,
      errors: []
    };
    
    // Process each pipeline
    for (const providerPipeline of providerPipelines) {
      try {
        // Find or create pipeline
        let pipeline = await Pipeline.findOne({
          integration: integration._id,
          externalId: providerPipeline.externalId
        });
        
        if (!pipeline) {
          // Create new pipeline
          pipeline = new Pipeline({
            name: providerPipeline.name,
            description: providerPipeline.description,
            integration: integration._id,
            organization: integration.organization,
            externalId: providerPipeline.externalId,
            repositoryUrl: providerPipeline.repositoryUrl,
            branchPattern: providerPipeline.branchPattern || '.*',
            config: providerPipeline.config || {}
          });
          
          await pipeline.save();
          results.pipelinesCreated++;
        } else {
          // Update existing pipeline
          pipeline.name = providerPipeline.name;
          pipeline.description = providerPipeline.description;
          pipeline.repositoryUrl = providerPipeline.repositoryUrl;
          pipeline.config = { ...pipeline.config, ...providerPipeline.config };
          
          await pipeline.save();
          results.pipelinesUpdated++;
        }
        
        // Fetch recent builds for this pipeline
        const builds = await provider.fetchBuilds({
          ...integration.config,
          apiToken: integration.apiToken,
          pipelineId: providerPipeline.externalId,
          limit: 10
        });
        
        // Process builds
        for (const buildData of builds) {
          // Check if build already exists
          const existingBuild = await Build.findOne({
            integration: integration._id,
            externalId: buildData.externalId
          });
          
          if (!existingBuild) {
            // Create new build
            const build = new Build({
              pipeline: pipeline._id,
              integration: integration._id,
              organization: integration.organization,
              externalId: buildData.externalId,
              externalUrl: buildData.externalUrl,
              number: buildData.number,
              status: buildData.status,
              startedAt: buildData.startedAt,
              finishedAt: buildData.finishedAt,
              duration: buildData.duration,
              trigger: buildData.trigger,
              git: buildData.git,
              stages: buildData.stages || [],
              jobs: buildData.jobs || [],
              artifacts: buildData.artifacts || [],
              environment: buildData.environment || {},
              tags: buildData.tags || []
            });
            
            await build.save();
            results.buildsCreated++;
          }
        }
      } catch (error) {
        logger.error('Error processing pipeline during sync', {
          error: error.message,
          pipelineId: providerPipeline.externalId
        });
        
        results.errors.push({
          pipelineId: providerPipeline.externalId,
          error: error.message
        });
      }
    }
    
    // Update integration last synced time
    integration.lastSyncedAt = new Date();
    await integration.save();
    
    logger.info('Integration sync completed', {
      integrationId,
      results: {
        pipelinesCreated: results.pipelinesCreated,
        pipelinesUpdated: results.pipelinesUpdated,
        buildsCreated: results.buildsCreated,
        errors: results.errors.length
      }
    });
    
    return results;
  } catch (error) {
    logger.error('Integration sync failed', {
      error: error.message,
      integrationId
    });
    
    // Update integration with error
    try {
      await Integration.updateOne(
        { _id: integrationId },
        {
          error: {
            message: error.message,
            timestamp: new Date()
          }
        }
      );
    } catch (updateError) {
      logger.error('Failed to update integration with error', {
        error: updateError.message,
        integrationId
      });
    }
    
    throw error;
  }
};

/**
 * Process webhook from a CI/CD provider
 * @param {string} provider - Provider type
 * @param {string} integrationId - Integration ID
 * @param {Object} payload - Webhook payload
 * @param {Object} headers - Webhook headers
 * @returns {Promise<Object>} Processing result
 */
exports.processWebhook = async (provider, integrationId, payload, headers) => {
  logger.info('Processing webhook', { provider, integrationId });
  
  try {
    const integration = await Integration.findById(integrationId);
    
    if (!integration) {
      throw new ApiError('Integration not found', 404);
    }
    
    if (integration.provider !== provider) {
      throw new ApiError('Provider mismatch', 400);
    }
    
    // Get provider client
    const providerClient = getProviderClient(provider);
    
    // Verify webhook signature if provider supports it
    if (providerClient.verifyWebhookSignature) {
      const isValid = await providerClient.verifyWebhookSignature(
        payload,
        headers,
        integration.webhookSecret
      );
      
      if (!isValid) {
        logger.warn('Invalid webhook signature', { provider, integrationId });
        throw new ApiError('Invalid webhook signature', 401);
      }
    }
    
    // Parse webhook payload
    const parsedData = await providerClient.parseWebhook(payload, headers);
    
    if (!parsedData) {
      logger.warn('Could not parse webhook payload', { provider, integrationId });
      return { success: false, message: 'Could not parse webhook payload' };
    }
    
    // Handle different event types
    switch (parsedData.event) {
      case 'pipeline_created':
        // Add new pipeline
        return await handlePipelineCreated(integration, parsedData);
        
      case 'build_created':
      case 'build_updated':
        // Add or update build
        return await handleBuildEvent(integration, parsedData);
        
      default:
        logger.info('Ignoring unhandled webhook event', { 
          provider, 
          event: parsedData.event 
        });
        return { success: true, message: 'Event ignored' };
    }
  } catch (error) {
    logger.error('Error processing webhook', {
      error: error.message,
      provider,
      integrationId
    });
    throw error;
  }
};

/**
 * Handle pipeline created event
 * @param {Object} integration - Integration object
 * @param {Object} data - Parsed webhook data
 * @returns {Promise<Object>} Processing result
 */
async function handlePipelineCreated(integration, data) {
  try {
    // Check if pipeline already exists
    let pipeline = await Pipeline.findOne({
      integration: integration._id,
      externalId: data.pipeline.externalId
    });
    
    if (!pipeline) {
      // Create new pipeline
      pipeline = new Pipeline({
        name: data.pipeline.name,
        description: data.pipeline.description || '',
        integration: integration._id,
        organization: integration.organization,
        externalId: data.pipeline.externalId,
        repositoryUrl: data.pipeline.repositoryUrl,
        branchPattern: data.pipeline.branchPattern || '.*',
        config: data.pipeline.config || {}
      });
      
      await pipeline.save();
      logger.info('Pipeline created from webhook', { 
        pipelineId: pipeline._id,
        externalId: data.pipeline.externalId
      });
      
      return { 
        success: true, 
        message: 'Pipeline created successfully',
        pipeline: pipeline._id
      };
    }
    
    return { 
      success: true, 
      message: 'Pipeline already exists',
      pipeline: pipeline._id
    };
  } catch (error) {
    logger.error('Error handling pipeline created event', {
      error: error.message,
      integrationId: integration._id
    });
    throw error;
  }
}

/**
 * Handle build events (created or updated)
 * @param {Object} integration - Integration object
 * @param {Object} data - Parsed webhook data
 * @returns {Promise<Object>} Processing result
 */
async function handleBuildEvent(integration, data) {
  try {
    // Find pipeline for this build
    const pipeline = await Pipeline.findOne({
      integration: integration._id,
      externalId: data.build.pipelineExternalId
    });
    
    if (!pipeline) {
      logger.warn('Pipeline not found for build', {
        integrationId: integration._id,
        pipelineExternalId: data.build.pipelineExternalId
      });
      
      return { 
        success: false, 
        message: 'Pipeline not found for build' 
      };
    }
    
    // Check if build exists
    let build = await Build.findOne({
      integration: integration._id,
      externalId: data.build.externalId
    });
    
    if (!build) {
      // Create new build
      build = new Build({
        pipeline: pipeline._id,
        integration: integration._id,
        organization: integration.organization,
        externalId: data.build.externalId,
        externalUrl: data.build.externalUrl,
        number: data.build.number,
        status: data.build.status,
        startedAt: data.build.startedAt,
        finishedAt: data.build.finishedAt,
        duration: data.build.duration,
        trigger: data.build.trigger,
        git: data.build.git,
        stages: data.build.stages || [],
        jobs: data.build.jobs || [],
        artifacts: data.build.artifacts || [],
        environment: data.build.environment || {},
        tags: data.build.tags || []
      });
      
      await build.save();
      logger.info('Build created from webhook', { 
        buildId: build._id,
        externalId: data.build.externalId
      });
      
      return { 
        success: true, 
        message: 'Build created successfully',
        build: build._id
      };
    } else {
      // Update existing build
      build.status = data.build.status;
      build.finishedAt = data.build.finishedAt;
      build.duration = data.build.duration;
      build.stages = data.build.stages || build.stages;
      build.jobs = data.build.jobs || build.jobs;
      build.artifacts = data.build.artifacts || build.artifacts;
      
      await build.save();
      logger.info('Build updated from webhook', { 
        buildId: build._id,
        externalId: data.build.externalId,
        status: data.build.status
      });
      
      return { 
        success: true, 
        message: 'Build updated successfully',
        build: build._id
      };
    }
  } catch (error) {
    logger.error('Error handling build event', {
      error: error.message,
      integrationId: integration._id
    });
    throw error;
  }
}

/**
 * Get all integrations for an organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} List of integrations
 */
exports.getIntegrations = async (organizationId) => {
  try {
    logger.info('Getting integrations for organization', { organizationId });
    
    const integrations = await Integration.find({ organization: organizationId });
    
    return integrations;
  } catch (error) {
    logger.error('Error retrieving integrations', { 
      error: error.message, 
      organizationId 
    });
    throw error;
  }
}; 