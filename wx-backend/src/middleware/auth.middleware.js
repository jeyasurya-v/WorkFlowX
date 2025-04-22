/**
 * Authentication Middleware
 * 
 * Middleware functions to manage authentication
 * and authorization for API routes.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const { verifyToken, extractTokenFromRequest } = require('../utils/jwt.utils');
const config = require('../config');
const logger = require('../utils/logger');
const mockAuthService = require('../services/mockAuth.service');

// Flag to track if MongoDB is available
let isMongoDBAvailable = true;

// Helper to detect MongoDB availability
const checkMongoDBAvailability = async () => {
  try {
    await User.findOne({}).exec();
    if (!isMongoDBAvailable) {
      logger.info('MongoDB connection restored, using real database');
    }
    isMongoDBAvailable = true;
    return true;
  } catch (error) {
    if (isMongoDBAvailable) {
      logger.warn('MongoDB unavailable, falling back to mock authentication', { error: error.message });
    }
    isMongoDBAvailable = false;
    return false;
  }
};

/**
 * Authenticate user using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Extract token from request
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      throw new ApiError('No authentication token provided', 401);
    }
    
    // Check if MongoDB is available
    const mongoAvailable = await checkMongoDBAvailability();
    
    if (mongoAvailable) {
      // Original database implementation
      // Verify token
      let decoded;
      try {
        decoded = verifyToken(token, config.jwt.secret);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new ApiError('Authentication token expired', 401);
        }
        throw new ApiError('Invalid authentication token', 401);
      }
      
      // Find user
      const user = await User.findById(decoded.userId || decoded.sub);
      
      if (!user) {
        throw new ApiError('User not found', 401);
      }
      
      if (!user.isActive) {
        throw new ApiError('User account is inactive', 403);
      }
      
      // Set user in request
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
    } else {
      // Use mock service
      try {
        const decoded = mockAuthService.verifyToken(token);
        
        // Get user from mock service
        const user = await mockAuthService.getUserById(decoded.sub);
        
        if (!user) {
          throw new ApiError('User not found (Mock Mode)', 401);
        }
        
        // Set user in request
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role
        };
        
        logger.debug('User authenticated via mock service', { email: user.email });
      } catch (error) {
        throw new ApiError('Invalid authentication token (Mock Mode)', 401);
      }
    }
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: error.message });
    
    return next(error);
  }
};

/**
 * Authenticate user using JWT - Simple wrapper around authenticate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.authenticateJWT = exports.authenticate;

/**
 * Limit access to specific user roles
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('No authenticated user found', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
};

/**
 * Limit access to the authenticated user's own resources
 * @param {String} paramName - Name of URL parameter containing user ID
 * @returns {Function} Middleware function
 */
exports.restrictToSelf = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('No authenticated user found', 401));
    }
    
    const paramId = req.params[paramName];
    
    if (!paramId) {
      return next(new ApiError(`No ${paramName} parameter found`, 400));
    }
    
    // Super admins can access any user
    if (req.user.role === 'admin' && req.user.isSuperAdmin) {
      return next();
    }
    
    // Check if authenticated user matches requested user
    if (req.user.id.toString() !== paramId.toString()) {
      return next(new ApiError('You do not have permission to access another user\'s data', 403));
    }
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if no token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return next();
    }
    
    try {
      const decoded = verifyToken(token, config.jwt.secret);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role
        };
      }
    } catch (error) {
      // Don't fail if token is invalid, just continue without user
      logger.debug('Optional auth token invalid', { error: error.message });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user belongs to organization
 */
exports.belongsToOrganization = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    // Find user's organizations
    const user = await User.findById(req.user.id).populate('organizations');
    
    // Check if user belongs to organization
    const isMember = user.organizations.some(org => org._id.toString() === organizationId);
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this organization'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
