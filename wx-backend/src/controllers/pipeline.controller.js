const Pipeline = require('../models/pipeline.model');
const Organization = require('../models/organization.model');
const Build = require('../models/build.model');
const { encryptCredentials, decryptCredentials } = require('../utils/encryption.utils');
const { setupWebhook } = require('../services/webhook.service');
const { validatePipelineAccess } = require('../services/authorization.service');

/**
 * Create a new pipeline
 */
exports.createPipeline = async (req, res, next) => {
  try {
    const { name, description, provider, repositoryUrl, branch, organizationId, credentials, tags = [] } = req.body;

    // Check if user has access to organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user has permission to create pipelines in this organization
    const hasPermission = organization.hasRole(req.user.id, ['admin', 'maintainer']);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create pipelines in this organization'
      });
    }

    // Encrypt sensitive credentials
    const encryptedCredentials = await encryptCredentials(credentials);

    // Create webhook for the pipeline
    const webhookData = await setupWebhook(provider, repositoryUrl, encryptedCredentials);

    // Create new pipeline
    const newPipeline = new Pipeline({
      name,
      description,
      provider,
      repositoryUrl,
      branch,
      organization: organizationId,
      credentials: encryptedCredentials,
      webhookUrl: webhookData?.webhookUrl,
      webhookSecret: webhookData?.webhookSecret,
      tags,
      createdBy: req.user.id
    });

    await newPipeline.save();

    res.status(201).json({
      success: true,
      message: 'Pipeline created successfully',
      pipeline: {
        id: newPipeline._id,
        name: newPipeline.name,
        description: newPipeline.description,
        provider: newPipeline.provider,
        repositoryUrl: newPipeline.repositoryUrl,
        branch: newPipeline.branch,
        webhookUrl: newPipeline.webhookUrl,
        tags: newPipeline.tags,
        status: newPipeline.status,
        createdAt: newPipeline.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pipelines for an organization
 */
exports.getOrganizationPipelines = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const { status, provider, search, sort = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    // Check if user has access to organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is a member of the organization
    const isMember = organization.isMember(req.user.id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this organization'
      });
    }

    // Build query
    const query = { organization: organizationId, isActive: true };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add provider filter if provided
    if (provider) {
      query.provider = provider;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { repositoryUrl: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sort] = sortOrder;

    // Get pipelines
    const pipelines = await Pipeline.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName email avatar');

    // Get total count for pagination
    const totalCount = await Pipeline.countDocuments(query);

    res.status(200).json({
      success: true,
      pipelines,
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
 * Get pipeline by ID
 */
exports.getPipeline = async (req, res, next) => {
  try {
    const { pipelineId } = req.params;

    // Get pipeline with organization info
    const pipeline = await Pipeline.findById(pipelineId)
      .populate('organization', 'name logo')
      .populate('createdBy', 'firstName lastName email avatar');

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

    // Get recent builds
    const recentBuilds = await Build.find({ pipeline: pipelineId })
      .sort({ buildNumber: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      pipeline: {
        ...pipeline.toObject(),
        recentBuilds
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update pipeline
 */
exports.updatePipeline = async (req, res, next) => {
  try {
    const { pipelineId } = req.params;
    const { name, description, branch, credentials, tags, config } = req.body;

    // Find pipeline
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Check if user has permission to update pipeline
    const organization = await Organization.findById(pipeline.organization);
    const hasPermission = organization.hasRole(req.user.id, ['admin', 'maintainer']);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this pipeline'
      });
    }

    // Update pipeline fields
    if (name) pipeline.name = name;
    if (description !== undefined) pipeline.description = description;
    if (branch) pipeline.branch = branch;
    if (tags) pipeline.tags = tags;
    if (config) pipeline.config = { ...pipeline.config, ...config };

    // Update credentials if provided
    if (credentials) {
      // Get existing credentials
      const pipelineWithCredentials = await Pipeline.findById(pipelineId).select('+credentials');
      const existingCredentials = pipelineWithCredentials.credentials;
      
      // Decrypt existing credentials
      const decryptedCredentials = await decryptCredentials(existingCredentials);
      
      // Merge with new credentials
      const updatedCredentials = { ...decryptedCredentials, ...credentials };
      
      // Encrypt updated credentials
      pipeline.credentials = await encryptCredentials(updatedCredentials);
    }

    await pipeline.save();

    res.status(200).json({
      success: true,
      message: 'Pipeline updated successfully',
      pipeline: {
        id: pipeline._id,
        name: pipeline.name,
        description: pipeline.description,
        provider: pipeline.provider,
        repositoryUrl: pipeline.repositoryUrl,
        branch: pipeline.branch,
        webhookUrl: pipeline.webhookUrl,
        tags: pipeline.tags,
        status: pipeline.status,
        config: pipeline.config,
        updatedAt: pipeline.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete pipeline
 */
exports.deletePipeline = async (req, res, next) => {
  try {
    const { pipelineId } = req.params;

    // Find pipeline
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Check if user has permission to delete pipeline
    const organization = await Organization.findById(pipeline.organization);
    const hasPermission = organization.hasRole(req.user.id, ['admin']);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this pipeline'
      });
    }

    // Soft delete by setting isActive to false
    pipeline.isActive = false;
    await pipeline.save();

    res.status(200).json({
      success: true,
      message: 'Pipeline deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger a manual build
 */
exports.triggerBuild = async (req, res, next) => {
  try {
    const { pipelineId } = req.params;
    const { branch, commitSha } = req.body;

    // Find pipeline
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Check if user has permission to trigger build
    const organization = await Organization.findById(pipeline.organization);
    const hasPermission = organization.hasRole(req.user.id, ['admin', 'maintainer', 'developer']);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to trigger builds for this pipeline'
      });
    }

    // Get pipeline credentials
    const pipelineWithCredentials = await Pipeline.findById(pipelineId).select('+credentials');
    const credentials = pipelineWithCredentials.credentials;

    // Trigger build using appropriate provider service
    const providerService = require(`../services/providers/${pipeline.provider}.service`);
    const buildData = await providerService.triggerBuild(pipeline, credentials, {
      branch: branch || pipeline.branch,
      commitSha,
      triggeredBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Build triggered successfully',
      build: buildData
    });
  } catch (error) {
    next(error);
  }
};
