/**
 * Custom CORS Middleware
 * 
 * This middleware adds proper CORS headers to all responses and
 * handles preflight requests correctly.
 */

const config = require('../config');

module.exports = (req, res, next) => {
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // Log request details for debugging
  console.log(`[CORS] Request from origin: ${origin || 'unknown'} to ${req.method} ${req.url}`);
  
  // Check if the origin is allowed (if origin is in our allowed list or if we allow all origins)
  const allowedOrigins = Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin];
  const isAllowedOrigin = !origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin);
  
  if (isAllowedOrigin) {
    // Set CORS headers for allowed origins
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    console.log(`[CORS] Origin ${origin || 'unknown'} is allowed`);
  } else {
    console.log(`[CORS] Origin ${origin} is NOT allowed`);
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS preflight request');
    return res.status(204).end();
  }
  
  return next();
}; 