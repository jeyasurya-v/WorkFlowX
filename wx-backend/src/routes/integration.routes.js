/**
 * Integration Routes
 * 
 * API routes for managing CI/CD integrations.
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const integrationController = require('../controllers/integration.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkOrgPermission } = require('../middleware/permission.middleware');

// Get list of supported providers (public route)
router.get('/providers', integrationController.getSupportedProviders);

// Get all integrations for an organization
router.get(
  '/',
  authMiddleware.authenticate,
  checkOrgPermission('viewIntegrations'),
  integrationController.getIntegrations
);

// Create a new integration
router.post(
  '/',
  authMiddleware.authenticate,
  checkOrgPermission('manageIntegrations'),
  integrationController.createIntegration
);

// Get a single integration
router.get(
  '/:integrationId',
  authMiddleware.authenticate,
  checkOrgPermission('viewIntegrations'),
  integrationController.getIntegration
);

// Update an integration
router.put(
  '/:integrationId',
  authMiddleware.authenticate,
  checkOrgPermission('manageIntegrations'),
  integrationController.updateIntegration
);

// Delete an integration
router.delete(
  '/:integrationId',
  authMiddleware.authenticate,
  checkOrgPermission('manageIntegrations'),
  integrationController.deleteIntegration
);

// Sync an integration
router.post(
  '/:integrationId/sync',
  authMiddleware.authenticate,
  checkOrgPermission('manageIntegrations'),
  integrationController.syncIntegration
);

// Webhook routes (no authentication required, validated by provider secrets)
router.post(
  '/webhooks/:provider/:integrationId',
  integrationController.handleWebhook
);

module.exports = router;
