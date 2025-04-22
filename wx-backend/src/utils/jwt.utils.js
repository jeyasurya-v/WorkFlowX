const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('./logger');

/**
 * Generate JWT access and refresh tokens for a user
 * @param {Object} user - User object
 * @returns {Object} Object containing access and refresh tokens
 */
exports.generateTokens = async (user) => {
  try {
    // Generate access token
    const accessToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiration }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshTokenExpiration }
    );

    logger.debug('Tokens generated', { userId: user._id });
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Token generation error', { error: error.message, userId: user._id });
    throw error;
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key to use for verification
 * @returns {Object} Decoded token payload
 */
exports.verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.warn('Token verification failed', { error: error.message });
    throw error;
  }
};

/**
 * Extract token from request
 * @param {Object} req - Express request object
 * @returns {string|null} Extracted token or null if not found
 */
exports.extractTokenFromRequest = (req) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    return null;
  } catch (error) {
    logger.warn('Error extracting token', { error: error.message });
    return null;
  }
};
