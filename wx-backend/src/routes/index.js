const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const organizationRoutes = require('./organization.routes');
const pipelineRoutes = require('./pipeline.routes');
const integrationRoutes = require('./integration.routes');
const webhookRoutes = require('./webhook.routes');
const analyticsRoutes = require('./analytics.routes');
const notificationRoutes = require('./notification.routes');
const healthRoutes = require('./health.routes');

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Organization routes
router.use('/organizations', organizationRoutes);

// Direct integration routes (not scoped to organization, like webhooks and providers list)
router.use('/integrations', integrationRoutes);

// Organization-scoped integration routes
router.use('/organizations/:organizationId/integrations', integrationRoutes);

// Pipeline routes 
router.use('/pipelines', pipelineRoutes);

// Organization-scoped pipeline routes
router.use('/organizations/:organizationId/pipelines', pipelineRoutes);

// Integration routes
router.use('/integrations', integrationRoutes);

// Webhook routes
router.use('/webhooks', webhookRoutes);

// Analytics routes
router.use('/analytics', analyticsRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Health check route
router.use('/health', healthRoutes);

// Base route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to PipelineRadar API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

module.exports = router;
