/**
 * Request logging middleware
 * Logs incoming HTTP requests and their responses
 */

const logger = require('../utils/logger');

/**
 * Middleware to log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 15);
  
  // Log request details
  logger.info(`Incoming request ${req.method} ${req.originalUrl}`, {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Capture original methods
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  
  // Override send
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    
    logger.info(`Response sent for ${req.method} ${req.originalUrl}`, {
      requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    });
    
    return originalSend.apply(res, arguments);
  };
  
  // Override json
  res.json = function(body) {
    const responseTime = Date.now() - startTime;
    
    logger.info(`Response sent for ${req.method} ${req.originalUrl}`, {
      requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    });
    
    return originalJson.apply(res, arguments);
  };
  
  // Override end
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    logger.info(`Response sent for ${req.method} ${req.originalUrl}`, {
      requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    });
    
    return originalEnd.apply(res, arguments);
  };
  
  // Continue to next middleware
  next();
};

module.exports = requestLogger; 