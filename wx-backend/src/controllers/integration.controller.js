/**
 * Integration Controller
 * 
 * Handles API endpoints for managing CI/CD integrations.
 */

const integrationService = require('../services/integration.service');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

/**
 * Get all integrations for an organization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getIntegrations = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    // Validate organization ID
    if (!organizationId) {
      throw new ApiError('Organization ID is required', 400);
    }

    // Get integrations from database
    const integrations = await integrationService.getIntegrations(organizationId);
    
    // Return success response
    return res.status(200).json({
      success: true,
      count: integrations.length,
      data: integrations
    });
  } catch (error) {
    logger.error('Error getting integrations', { 
      error: error.message,
      organizationId: req.params.organizationId
    });
    
    return next(error);
  }
};

/**
 * Get a single integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getIntegration = async (req, res, next) => {
  try {
    const { integrationId, organizationId } = req.params;
    
    // Validate IDs
    if (!integrationId || !organizationId) {
      throw new ApiError('Integration ID and Organization ID are required', 400);
    }
    
    // Get integration from database
    const integration = await integrationService.getIntegration(
      integrationId,
      organizationId
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: integration
    });
  } catch (error) {
    logger.error('Error getting integration', { 
      error: error.message,
      integrationId: req.params.integrationId
    });
    
    return next(error);
  }
};

/**
 * Create a new integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createIntegration = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.id;
    
    // Validate organization ID
    if (!organizationId) {
      throw new ApiError('Organization ID is required', 400);
    }
    
    // Create integration data object
    const integrationData = {
      ...req.body,
      organization: organizationId
    };
    
    // Add validation for required fields
    const requiredFields = ['name', 'provider'];
    const missingFields = requiredFields.filter(field => !integrationData[field]);
    
    if (missingFields.length > 0) {
      throw new ApiError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }
    
    // Create integration
    const integration = await integrationService.createIntegration(
      integrationData,
      userId
    );
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Integration created successfully',
      data: integration
    });
  } catch (error) {
    logger.error('Error creating integration', { 
      error: error.message,
      organizationId: req.params.organizationId,
      provider: req.body.provider
    });
    
    return next(error);
  }
};

/**
 * Update an integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateIntegration = async (req, res, next) => {
  try {
    const { integrationId, organizationId } = req.params;
    
    // Validate IDs
    if (!integrationId || !organizationId) {
      throw new ApiError('Integration ID and Organization ID are required', 400);
    }
    
    // Update integration
    const integration = await integrationService.updateIntegration(
      integrationId,
      req.body,
      organizationId
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Integration updated successfully',
      data: integration
    });
  } catch (error) {
    logger.error('Error updating integration', { 
      error: error.message,
      integrationId: req.params.integrationId
    });
    
    return next(error);
  }
};

/**
 * Delete an integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteIntegration = async (req, res, next) => {
  try {
    const { integrationId, organizationId } = req.params;
    
    // Validate IDs
    if (!integrationId || !organizationId) {
      throw new ApiError('Integration ID and Organization ID are required', 400);
    }
    
    // Delete integration
    await integrationService.deleteIntegration(
      integrationId,
      organizationId
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting integration', { 
      error: error.message,
      integrationId: req.params.integrationId
    });
    
    return next(error);
  }
};

/**
 * Sync an integration with the provider
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.syncIntegration = async (req, res, next) => {
  try {
    const { integrationId, organizationId } = req.params;
    
    // Validate IDs
    if (!integrationId || !organizationId) {
      throw new ApiError('Integration ID and Organization ID are required', 400);
    }
    
    // Sync integration
    const results = await integrationService.syncIntegration(integrationId);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Integration synced successfully',
      data: results
    });
  } catch (error) {
    logger.error('Error syncing integration', { 
      error: error.message,
      integrationId: req.params.integrationId
    });
    
    return next(error);
  }
};

/**
 * Get supported providers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSupportedProviders = (req, res) => {
  // List of supported CI/CD providers
  const providers = [
    {
      id: 'github',
      name: 'GitHub Actions',
      icon: 'github',
      description: 'Connect to GitHub Actions workflows',
      documentationUrl: 'https://docs.github.com/en/actions',
      configSchema: {
        owner: {
          type: 'string',
          required: true,
          description: 'GitHub username or organization name'
        },
        repo: {
          type: 'string',
          required: false,
          description: 'Repository name (leave empty to sync all repos)'
        },
        apiToken: {
          type: 'string',
          required: true,
          description: 'GitHub Personal Access Token with repo and workflow scopes',
          secret: true
        }
      }
    },
    {
      id: 'gitlab',
      name: 'GitLab CI',
      icon: 'gitlab',
      description: 'Connect to GitLab CI/CD pipelines',
      documentationUrl: 'https://docs.gitlab.com/ee/ci/',
      configSchema: {
        host: {
          type: 'string',
          required: false,
          default: 'https://gitlab.com',
          description: 'GitLab instance URL'
        },
        groupPath: {
          type: 'string',
          required: false,
          description: 'Group path (leave empty to sync all projects)'
        },
        projectPath: {
          type: 'string',
          required: false,
          description: 'Project path (leave empty to sync all projects)'
        },
        apiToken: {
          type: 'string',
          required: true,
          description: 'GitLab Personal Access Token with api scope',
          secret: true
        }
      }
    },
    {
      id: 'jenkins',
      name: 'Jenkins',
      icon: 'jenkins',
      description: 'Connect to Jenkins jobs and builds',
      documentationUrl: 'https://www.jenkins.io/doc/',
      configSchema: {
        url: {
          type: 'string',
          required: true,
          description: 'Jenkins server URL'
        },
        username: {
          type: 'string',
          required: true,
          description: 'Jenkins username'
        },
        apiToken: {
          type: 'string',
          required: true,
          description: 'Jenkins API token',
          secret: true
        },
        folderFilter: {
          type: 'string',
          required: false,
          description: 'Only sync jobs in folders matching this filter'
        }
      }
    },
    {
      id: 'circleci',
      name: 'CircleCI',
      icon: 'circleci',
      description: 'Connect to CircleCI pipelines and workflows',
      documentationUrl: 'https://circleci.com/docs/',
      configSchema: {
        organization: {
          type: 'string',
          required: false,
          description: 'CircleCI organization name'
        },
        apiToken: {
          type: 'string',
          required: true,
          description: 'CircleCI API token',
          secret: true
        }
      }
    }
  ];
  
  return res.status(200).json({
    success: true,
    data: providers
  });
};

/**
 * Handle webhook from a CI/CD provider
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.handleWebhook = async (req, res, next) => {
  try {
    const { provider, integrationId } = req.params;
    
    // Validate parameters
    if (!provider || !integrationId) {
      throw new ApiError('Provider and integration ID are required', 400);
    }
    
    // Process webhook
    const result = await integrationService.processWebhook(
      provider,
      integrationId,
      req.body,
      req.headers
    );
    
    // Return response
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error processing webhook', { 
      error: error.message,
      provider: req.params.provider,
      integrationId: req.params.integrationId
    });
    
    // For webhook errors, always return 200 to avoid retries
    return res.status(200).json({
      success: false,
      message: error.message
    });
  }
}; 