const express = require('express');
const router = express.Router();
const config = require('../config');

/**
 * @route GET /api/v1/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is up and running',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

module.exports = router;
