const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipeline.controller');
const { authenticateJWT, authorizeRoles, belongsToOrganization } = require('../middleware/auth.middleware');
const { validatePipeline } = require('../middleware/validation.middleware');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Create a new pipeline
router.post('/', validatePipeline, pipelineController.createPipeline);

// Get all pipelines for an organization
router.get('/organization/:organizationId', belongsToOrganization, pipelineController.getOrganizationPipelines);

// Get pipeline by ID
router.get('/:pipelineId', pipelineController.getPipeline);

// Update pipeline
router.put('/:pipelineId', pipelineController.updatePipeline);

// Delete pipeline (soft delete)
router.delete('/:pipelineId', pipelineController.deletePipeline);

// Trigger a manual build
router.post('/:pipelineId/trigger', pipelineController.triggerBuild);

module.exports = router;
