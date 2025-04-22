const Organization = require('../models/organization.model');
const Pipeline = require('../models/pipeline.model');

/**
 * Validate if a user has access to a pipeline
 * @param {string} userId - User ID
 * @param {Object} pipeline - Pipeline document or ID
 * @returns {boolean} - Whether user has access
 */
exports.validatePipelineAccess = async (userId, pipeline) => {
  try {
    // Get pipeline ID
    const pipelineId = pipeline._id || pipeline;
    
    // Get pipeline if only ID was provided
    let pipelineDoc = pipeline._id ? pipeline : await Pipeline.findById(pipelineId);
    
    if (!pipelineDoc) {
      return false;
    }
    
    // Get organization
    const organization = await Organization.findById(pipelineDoc.organization);
    
    if (!organization) {
      return false;
    }
    
    // Check if user is a member of the organization
    return organization.isMember(userId);
  } catch (error) {
    console.error('Error validating pipeline access:', error);
    return false;
  }
};

/**
 * Validate if a user has specific role for a pipeline
 * @param {string} userId - User ID
 * @param {Object} pipeline - Pipeline document or ID
 * @param {Array} roles - Array of allowed roles
 * @returns {boolean} - Whether user has required role
 */
exports.validatePipelineRole = async (userId, pipeline, roles) => {
  try {
    // Get pipeline ID
    const pipelineId = pipeline._id || pipeline;
    
    // Get pipeline if only ID was provided
    let pipelineDoc = pipeline._id ? pipeline : await Pipeline.findById(pipelineId);
    
    if (!pipelineDoc) {
      return false;
    }
    
    // Get organization
    const organization = await Organization.findById(pipelineDoc.organization);
    
    if (!organization) {
      return false;
    }
    
    // Check if user has required role
    return organization.hasRole(userId, roles);
  } catch (error) {
    console.error('Error validating pipeline role:', error);
    return false;
  }
};

/**
 * Validate if a user has access to an organization
 * @param {string} userId - User ID
 * @param {Object} organization - Organization document or ID
 * @returns {boolean} - Whether user has access
 */
exports.validateOrganizationAccess = async (userId, organization) => {
  try {
    // Get organization ID
    const organizationId = organization._id || organization;
    
    // Get organization if only ID was provided
    let organizationDoc = organization._id ? organization : await Organization.findById(organizationId);
    
    if (!organizationDoc) {
      return false;
    }
    
    // Check if user is a member of the organization
    return organizationDoc.isMember(userId);
  } catch (error) {
    console.error('Error validating organization access:', error);
    return false;
  }
};

/**
 * Validate if a user has specific role for an organization
 * @param {string} userId - User ID
 * @param {Object} organization - Organization document or ID
 * @param {Array} roles - Array of allowed roles
 * @returns {boolean} - Whether user has required role
 */
exports.validateOrganizationRole = async (userId, organization, roles) => {
  try {
    // Get organization ID
    const organizationId = organization._id || organization;
    
    // Get organization if only ID was provided
    let organizationDoc = organization._id ? organization : await Organization.findById(organizationId);
    
    if (!organizationDoc) {
      return false;
    }
    
    // Check if user has required role
    return organizationDoc.hasRole(userId, roles);
  } catch (error) {
    console.error('Error validating organization role:', error);
    return false;
  }
};

/**
 * Get user's role in an organization
 * @param {string} userId - User ID
 * @param {Object} organization - Organization document or ID
 * @returns {string|null} - User's role or null if not a member
 */
exports.getUserOrganizationRole = async (userId, organization) => {
  try {
    // Get organization ID
    const organizationId = organization._id || organization;
    
    // Get organization if only ID was provided
    let organizationDoc = organization._id ? organization : await Organization.findById(organizationId);
    
    if (!organizationDoc) {
      return null;
    }
    
    // Find member
    const member = organizationDoc.members.find(m => m.user.toString() === userId.toString());
    
    return member ? member.role : null;
  } catch (error) {
    console.error('Error getting user organization role:', error);
    return null;
  }
};

/**
 * Check if user can perform an action on a resource
 * @param {string} userId - User ID
 * @param {string} action - Action to perform
 * @param {Object} resource - Resource object
 * @param {string} resourceType - Type of resource
 * @returns {boolean} - Whether user can perform action
 */
exports.canPerformAction = async (userId, action, resource, resourceType) => {
  try {
    switch (resourceType) {
      case 'organization':
        return await canPerformOrganizationAction(userId, action, resource);
      case 'pipeline':
        return await canPerformPipelineAction(userId, action, resource);
      case 'build':
        return await canPerformBuildAction(userId, action, resource);
      case 'deployment':
        return await canPerformDeploymentAction(userId, action, resource);
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking action permission:', error);
    return false;
  }
};

/**
 * Check if user can perform an action on an organization
 * @param {string} userId - User ID
 * @param {string} action - Action to perform
 * @param {Object} organization - Organization document or ID
 * @returns {boolean} - Whether user can perform action
 */
const canPerformOrganizationAction = async (userId, action, organization) => {
  // Get organization role
  const role = await exports.getUserOrganizationRole(userId, organization);
  
  if (!role) {
    return false;
  }
  
  // Define permissions for each role
  const permissions = {
    admin: ['view', 'edit', 'delete', 'invite', 'remove_member', 'change_role', 'create_pipeline'],
    maintainer: ['view', 'edit', 'invite', 'create_pipeline'],
    developer: ['view', 'create_pipeline'],
    viewer: ['view']
  };
  
  // Check if role has permission for action
  return permissions[role] && permissions[role].includes(action);
};

/**
 * Check if user can perform an action on a pipeline
 * @param {string} userId - User ID
 * @param {string} action - Action to perform
 * @param {Object} pipeline - Pipeline document or ID
 * @returns {boolean} - Whether user can perform action
 */
const canPerformPipelineAction = async (userId, action, pipeline) => {
  // Get pipeline
  const pipelineDoc = pipeline._id ? pipeline : await Pipeline.findById(pipeline);
  
  if (!pipelineDoc) {
    return false;
  }
  
  // Get organization role
  const role = await exports.getUserOrganizationRole(userId, pipelineDoc.organization);
  
  if (!role) {
    return false;
  }
  
  // Define permissions for each role
  const permissions = {
    admin: ['view', 'edit', 'delete', 'trigger_build', 'cancel_build'],
    maintainer: ['view', 'edit', 'trigger_build', 'cancel_build'],
    developer: ['view', 'trigger_build'],
    viewer: ['view']
  };
  
  // Check if role has permission for action
  return permissions[role] && permissions[role].includes(action);
};

/**
 * Check if user can perform an action on a build
 * @param {string} userId - User ID
 * @param {string} action - Action to perform
 * @param {Object} build - Build document or ID
 * @returns {boolean} - Whether user can perform action
 */
const canPerformBuildAction = async (userId, action, build) => {
  // For builds, we check pipeline permissions
  return await canPerformPipelineAction(userId, action, build.pipeline);
};

/**
 * Check if user can perform an action on a deployment
 * @param {string} userId - User ID
 * @param {string} action - Action to perform
 * @param {Object} deployment - Deployment document or ID
 * @returns {boolean} - Whether user can perform action
 */
const canPerformDeploymentAction = async (userId, action, deployment) => {
  // For deployments, we check pipeline permissions
  return await canPerformPipelineAction(userId, action, deployment.pipeline);
};
