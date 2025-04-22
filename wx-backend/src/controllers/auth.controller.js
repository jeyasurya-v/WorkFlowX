/**
 * Authentication Controller
 * 
 * Handles user authentication operations including registration,
 * login, logout, token refresh, and OAuth authentications.
 * 
 * @module controllers/auth
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { generateTokens } = require('../utils/jwt.utils');
const config = require('../config');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');
const { sanitizeUser } = require('../utils/sanitizers');

// Import mock auth service for fallback
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
 * Register a new user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with user data and tokens
 */
exports.register = async (req, res, next) => {
  try {
    logger.info('Register request received', { email: req.body.email });
    const { email, password, firstName, lastName } = req.body;

    // Check MongoDB availability and use appropriate service
    const mongoAvailable = await checkMongoDBAvailability();
    
    if (mongoAvailable) {
      // Original database implementation
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.warn('Registration failed: User already exists', { email });
        throw new ApiError('User with this email already exists', 409);
      }

      // Create new user
      const newUser = new User({
        email,
        password, // Will be hashed in the pre-save hook
        firstName,
        lastName,
        role: 'developer', // Default role from the valid enum values
      });

      await newUser.save();
      logger.info('New user created', { userId: newUser._id });

      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(newUser);

      // Save refresh token
      const refreshExpiration = new Date(
        Date.now() + parseInt(config.jwt.refreshTokenExpiration) * 1000
      );
      
      const newRefreshToken = new RefreshToken({
        token: refreshToken,
        user: newUser._id,
        expiresAt: refreshExpiration,
      });
      
      await newRefreshToken.save();
      logger.debug('Refresh token saved', { userId: newUser._id });

      // Return success response with tokens
      return res.status(201)
        .json({
          success: true,
          message: 'User registered successfully',
          user: sanitizeUser(newUser),
          tokens: {
            accessToken,
            refreshToken
          }
        });
    } else {
      // Use mock service when MongoDB is unavailable
      logger.info('Using mock register service', { email });
      
      try {
        const result = await mockAuthService.register({ email, password, firstName, lastName });
        
        return res.status(201)
          .json({
            success: true,
            message: 'User registered successfully (Mock Mode)',
            user: result.user,
            tokens: result.tokens
          });
      } catch (mockError) {
        logger.error('Mock registration error', { error: mockError.message });
        throw new ApiError(mockError.message, mockError.message.includes('exists') ? 409 : 500);
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    logger.error('Registration error', { error: error.message, stack: error.stack });
    return next(new ApiError('Registration failed', 500));
  }
};

/**
 * Login user with email and password
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with user data and tokens
 */
exports.login = async (req, res, next) => {
  try {
    logger.info('Login request received', { email: req.body.email });
    const { email, password } = req.body;

    // Check MongoDB availability and use appropriate service
    const mongoAvailable = await checkMongoDBAvailability();
    
    if (mongoAvailable) {
      // Original database implementation
      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        logger.warn('Login failed: User not found', { email });
        throw new ApiError('Invalid email or password', 401);
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.warn('Login failed: Invalid password', { email });
        throw new ApiError('Invalid email or password', 401);
      }

      logger.info('User authenticated successfully', { userId: user._id });

      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(user);

      // Save refresh token with expiration
      const refreshExpiration = new Date(
        Date.now() + parseInt(config.jwt.refreshTokenExpiration) * 1000
      );
      
      const newRefreshToken = new RefreshToken({
        token: refreshToken,
        user: user._id,
        expiresAt: refreshExpiration,
      });
      
      await newRefreshToken.save();
      logger.debug('Refresh token saved', { userId: user._id });

      // Return success response with tokens
      return res.status(200)
        .json({
          success: true,
          message: 'Login successful',
          user: sanitizeUser(user),
          tokens: {
            accessToken,
            refreshToken
          }
        });
    } else {
      // Use mock service when MongoDB is unavailable
      logger.info('Using mock login service', { email });
      
      try {
        const result = await mockAuthService.login(email, password);
        
        return res.status(200)
          .json({
            success: true,
            message: 'Login successful (Mock Mode)',
            user: result.user,
            tokens: result.tokens
          });
      } catch (mockError) {
        logger.error('Mock login error', { error: mockError.message });
        throw new ApiError(mockError.message, 401);
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    logger.error('Login error', { error: error.message, stack: error.stack });
    return next(new ApiError('Login failed', 500));
  }
};

/**
 * Refresh access token using refresh token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with new tokens
 */
exports.refreshToken = async (req, res, next) => {
  try {
    logger.info('Refresh token request received');
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn('Refresh token request missing token');
      throw new ApiError('Refresh token is required', 400);
    }

    // Check MongoDB availability and use appropriate service
    const mongoAvailable = await checkMongoDBAvailability();
    
    if (mongoAvailable) {
      // Original database implementation
      // Verify refresh token exists in database
      const storedToken = await RefreshToken.findOne({ token: refreshToken });
      if (!storedToken) {
        logger.warn('Refresh token not found in database');
        throw new ApiError('Invalid refresh token', 401);
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        logger.warn('Expired refresh token', { tokenId: storedToken._id });
        await RefreshToken.deleteOne({ _id: storedToken._id });
        throw new ApiError('Refresh token expired', 401);
      }

      // Find user
      const user = await User.findById(storedToken.user);
      if (!user) {
        logger.warn('User not found for refresh token', { userId: storedToken.user });
        await RefreshToken.deleteOne({ _id: storedToken._id });
        throw new ApiError('User not found', 401);
      }

      // Generate new tokens
      const tokens = await generateTokens(user);

      // Update refresh token with new expiration
      storedToken.token = tokens.refreshToken;
      storedToken.expiresAt = new Date(
        Date.now() + parseInt(config.jwt.refreshTokenExpiration) * 1000
      );
      
      await storedToken.save();
      logger.debug('Refresh token updated', { userId: user._id });

      // Return success response with new tokens
      return res.status(200)
        .json({
          success: true,
          message: 'Token refreshed successfully',
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          }
        });
    } else {
      // Use mock service when MongoDB is unavailable
      logger.info('Using mock refresh token service');
      
      try {
        const tokens = await mockAuthService.refreshToken(refreshToken);
        
        return res.status(200)
          .json({
            success: true,
            message: 'Token refreshed successfully (Mock Mode)',
            tokens
          });
      } catch (mockError) {
        logger.error('Mock token refresh error', { error: mockError.message });
        throw new ApiError(mockError.message, 401);
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    logger.error('Token refresh error', { error: error.message, stack: error.stack });
    return next(new ApiError('Token refresh failed', 500));
  }
};

/**
 * Logout user by invalidating refresh tokens
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response confirming logout
 */
exports.logout = async (req, res, next) => {
  try {
    // If user is authenticated, delete their refresh tokens
    if (req.user && req.user.id) {
      logger.info('Logout request for authenticated user', { userId: req.user.id });
      
      // Delete all refresh tokens for this user
      const result = await RefreshToken.deleteMany({ user: req.user.id });
      logger.debug('Refresh tokens deleted', { 
        userId: req.user.id, 
        count: result.deletedCount 
      });
    } else {
      // For requests with token in body or headers
      const { refreshToken } = req.body;
      if (refreshToken) {
        const token = await RefreshToken.findOneAndDelete({ token: refreshToken });
        if (token) {
          logger.info('Deleted refresh token from unauthenticated request', { tokenId: token._id });
        }
      } else {
        logger.info('Logout request with no identifiable user or token');
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message, stack: error.stack });
    return next(new ApiError('Logout failed', 500));
  }
};

/**
 * Get current user profile
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with user data
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // User should be available from auth middleware
    if (!req.user) {
      throw new ApiError('Not authenticated', 401);
    }
    
    // Get fresh user data from database
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn('User not found in getCurrentUser', { userId: req.user.id });
      throw new ApiError('User not found', 404);
    }
    
    logger.debug('Current user retrieved', { userId: user._id });
    
    return res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    logger.error('Get current user error', { error: error.message, stack: error.stack });
    return next(new ApiError('Failed to retrieve user profile', 500));
  }
};

/**
 * Initiate OAuth authentication with GitHub
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.githubAuth = passport.authenticate('github', { scope: ['user:email'] });

/**
 * Handle GitHub OAuth callback
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.githubCallback = async (req, res, next) => {
  try {
    const user = req.user;
    logger.info('GitHub authentication successful', { userId: user._id });
    
    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);
    
    // Save refresh token
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + parseInt(config.jwt.refreshTokenExpiration) * 1000),
    });
    
    await newRefreshToken.save();
    
    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${config.frontendUrl}/auth/oauth-callback`);
    redirectUrl.searchParams.append('access_token', accessToken);
    redirectUrl.searchParams.append('refresh_token', refreshToken);
    
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error('GitHub callback error', { error: error.message, stack: error.stack });
    return res.redirect(`${config.frontendUrl}/auth/login?error=oauth_failed`);
  }
};

/**
 * Initiate OAuth authentication with GitLab
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.gitlabAuth = passport.authenticate('gitlab');

/**
 * Handle GitLab OAuth callback
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.gitlabCallback = async (req, res, next) => {
  try {
    const user = req.user;
    logger.info('GitLab authentication successful', { userId: user._id });
    
    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);
    
    // Save refresh token
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + parseInt(config.jwt.refreshTokenExpiration) * 1000),
    });
    
    await newRefreshToken.save();
    
    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${config.frontendUrl}/auth/oauth-callback`);
    redirectUrl.searchParams.append('access_token', accessToken);
    redirectUrl.searchParams.append('refresh_token', refreshToken);
    
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error('GitLab callback error', { error: error.message, stack: error.stack });
    return res.redirect(`${config.frontendUrl}/auth/login?error=oauth_failed`);
  }
};
