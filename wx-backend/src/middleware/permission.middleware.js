/**
 * Permission Middleware
 * 
 * Middleware functions to check user permissions
 * for organization-specific actions.
 */

const Organization = require('../models/organization.model');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

/**
 * Check if user has specific permission in an organization
 * @param {string} permission - Permission to check
 * @returns {Function} Middleware function
 */
exports.checkOrgPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user.id;
      
      if (!organizationId) {
        throw new ApiError('Organization ID is required', 400);
      }
      
      const organization = await Organization.findById(organizationId);
      
      if (!organization) {
        throw new ApiError('Organization not found', 404);
      }
      
      // Check if user is owner (owners have all permissions)
      if (organization.owner.equals(userId)) {
        return next();
      }
      
      // Check if user is a member of the organization
      const member = organization.members.find(member => 
        member.user.equals(userId)
      );
      
      if (!member) {
        throw new ApiError('You are not a member of this organization', 403);
      }
      
      // Check role-based permissions
      if (member.role === 'admin') {
        // Admins have all permissions
        return next();
      }
      
      // Map permission string to specific permission checks
      let hasPermission = false;
      
      switch (permission) {
        case 'viewIntegrations':
          // All members can view integrations
          hasPermission = true;
          break;
          
        case 'manageIntegrations':
          // Only members with specific permission can manage integrations
          hasPermission = member.permissions && member.permissions.manageIntegrations === true;
          break;
          
        case 'viewPipelines':
          // All members can view pipelines
          hasPermission = true;
          break;
          
        case 'managePipelines':
          // Only members with specific permission can manage pipelines
          hasPermission = member.permissions && member.permissions.managePipelines === true;
          break;
          
        case 'manageMembers':
          // Only members with specific permission can manage members
          hasPermission = member.permissions && member.permissions.manageMembers === true;
          break;
          
        case 'viewAnalytics':
          // Members with viewAnalytics permission can view analytics
          hasPermission = member.permissions && member.permissions.viewAnalytics === true;
          break;
          
        default:
          // For any other permission, default to false
          hasPermission = false;
      }
      
      if (hasPermission) {
        return next();
      }
      
      // If we get here, the user doesn't have the required permission
      throw new ApiError(`You don't have permission to ${permission}`, 403);
      
    } catch (error) {
      logger.error('Permission check failed', {
        error: error.message,
        userId: req.user?.id,
        permission,
        organizationId: req.params.organizationId
      });
      
      return next(error);
    }
  };
};

/**
 * Check if user has admin access in an organization
 * @returns {Function} Middleware function
 */
exports.requireOrgAdmin = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.id;
    
    if (!organizationId) {
      throw new ApiError('Organization ID is required', 400);
    }
    
    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
      throw new ApiError('Organization not found', 404);
    }
    
    // Check if user is owner or admin
    if (organization.owner.equals(userId)) {
      return next();
    }
    
    const member = organization.members.find(member => 
      member.user.equals(userId) && member.role === 'admin'
    );
    
    if (!member) {
      throw new ApiError('You must be an admin to perform this action', 403);
    }
    
    return next();
  } catch (error) {
    logger.error('Admin permission check failed', {
      error: error.message,
      userId: req.user?.id,
      organizationId: req.params.organizationId
    });
    
    return next(error);
  }
};

/**
 * Check if user is the owner of an organization
 * @returns {Function} Middleware function
 */
exports.requireOrgOwner = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.id;
    
    if (!organizationId) {
      throw new ApiError('Organization ID is required', 400);
    }
    
    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
      throw new ApiError('Organization not found', 404);
    }
    
    // Check if user is owner
    if (!organization.owner.equals(userId)) {
      throw new ApiError('You must be the owner to perform this action', 403);
    }
    
    return next();
  } catch (error) {
    logger.error('Owner permission check failed', {
      error: error.message,
      userId: req.user?.id,
      organizationId: req.params.organizationId
    });
    
    return next(error);
  }
}; 