const express = require('express');
const router = express.Router();
const buildController = require('../controllers/build.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Get builds for a pipeline
router.get('/pipeline/:pipelineId', buildController.getPipelineBuilds);

// Get build by ID
router.get('/:buildId', buildController.getBuild);

// Get build logs
router.get('/:buildId/logs', buildController.getBuildLogs);

// Retry a build
router.post('/:buildId/retry', buildController.retryBuild);

// Cancel a build
router.post('/:buildId/cancel', buildController.cancelBuild);

// Add comment to a build
router.post('/:buildId/comments', buildController.addBuildComment);

module.exports = router;
