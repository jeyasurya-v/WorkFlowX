/**
 * Mock Authentication Service
 * 
 * Provides authentication functionality without requiring database connections.
 * This is useful for development and testing when databases are unavailable.
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

// In-memory storage for "users" and tokens
const mockUsers = new Map();
const mockTokens = new Map();

// Add a default test user
mockUsers.set('test@example.com', {
  _id: '123456789012345678901234',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: '$2a$10$X7VYHy5Oa4WY1WveBMZ3peTm9XlL9XE0vWPiYnkdBJf2g9uz.gGJ2', // 'password123'
  role: 'admin',
  createdAt: new Date()
});

/**
 * Generate JWT tokens for a user
 * @param {Object} user - User object
 * @returns {Object} Access and refresh tokens
 */
const generateTokens = async (user) => {
  // Create payload
  const payload = {
    sub: user._id,
    email: user.email,
    role: user.role
  };

  // Generate access token
  const accessToken = jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiration }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { sub: user._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshTokenExpiration }
  );

  // Store refresh token in mock storage
  const refreshExpiration = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  );
  
  mockTokens.set(refreshToken, {
    token: refreshToken,
    user: user._id,
    expiresAt: refreshExpiration
  });

  return { accessToken, refreshToken };
};

/**
 * Register a new user
 * @param {Object} userData - User data
 * @returns {Object} User object and tokens
 */
exports.register = async (userData) => {
  logger.info('Mock register service called', { email: userData.email });

  // Check if user already exists
  if (mockUsers.has(userData.email)) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const newUser = {
    _id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    password: 'hashed_password', // In a real app, this would be hashed
    role: 'developer',
    createdAt: new Date()
  };

  // Store user
  mockUsers.set(userData.email, newUser);
  logger.info('Mock user created', { userId: newUser._id });

  // Generate tokens
  const tokens = await generateTokens(newUser);

  return {
    user: {
      _id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role
    },
    tokens
  };
};

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password (plaintext for mock service)
 * @returns {Object} User object and tokens
 */
exports.login = async (email, password) => {
  logger.info('Mock login service called', { email });

  // Check if user exists
  if (!mockUsers.has(email)) {
    throw new Error('Invalid email or password');
  }

  const user = mockUsers.get(email);

  // In mock mode, accept any password for test@example.com
  // but require 'password123' for other accounts
  if (email !== 'test@example.com' && password !== 'password123') {
    throw new Error('Invalid email or password');
  }

  logger.info('Mock user authenticated', { userId: user._id });

  // Generate tokens
  const tokens = await generateTokens(user);

  return {
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    tokens
  };
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Object} New tokens
 */
exports.refreshToken = async (refreshToken) => {
  logger.info('Mock refresh token service called');

  // Check if token exists
  if (!mockTokens.has(refreshToken)) {
    throw new Error('Invalid refresh token');
  }

  const storedToken = mockTokens.get(refreshToken);

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    mockTokens.delete(refreshToken);
    throw new Error('Refresh token expired');
  }

  // Find user
  let user = null;
  for (const [_, u] of mockUsers.entries()) {
    if (u._id === storedToken.user) {
      user = u;
      break;
    }
  }

  if (!user) {
    mockTokens.delete(refreshToken);
    throw new Error('User not found');
  }

  // Generate new tokens
  const tokens = await generateTokens(user);

  // Delete old token and store new one
  mockTokens.delete(refreshToken);

  return tokens;
};

/**
 * Verify a token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Get user by ID (for authentication middleware)
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
exports.getUserById = async (userId) => {
  for (const [_, user] of mockUsers.entries()) {
    if (user._id === userId) {
      return {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      };
    }
  }
  return null;
}; 