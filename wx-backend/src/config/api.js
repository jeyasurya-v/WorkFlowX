/**
 * API Configuration Module
 * 
 * Centralizes API configuration and provides a debug route
 * to help troubleshoot CORS and other connection issues.
 */

const express = require('express');
const config = require('./index');
const router = express.Router();

// Debug route that returns configuration information
router.get('/debug', (req, res) => {
  // Log headers for debugging
  console.log('[DEBUG] Received request headers:', req.headers);
  
  // Return useful configuration information
  res.json({
    status: 'API is running',
    version: config.appVersion,
    environment: config.env,
    cors: {
      allowedOrigins: Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin],
      allowedMethods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders
    },
    client: {
      ip: req.ip,
      origin: req.get('origin'),
      userAgent: req.get('user-agent')
    },
    server: {
      port: config.port,
      apiUrl: config.apiUrl,
      frontendUrl: config.frontendUrl
    }
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    version: config.appVersion,
    timestamp: new Date().toISOString() 
  });
});

module.exports = router; 