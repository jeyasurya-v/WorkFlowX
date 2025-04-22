/**
 * Middleware index file
 * Exports all middleware for easy importing
 */

const requestLogger = require('./logger.middleware');
const authMiddleware = require('./auth.middleware');
const permissionMiddleware = require('./permission.middleware');

module.exports = {
  requestLogger,
  auth: authMiddleware,
  permission: permissionMiddleware
}; 