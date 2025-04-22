const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// GitHub webhooks
router.post('/github', express.json({ verify: webhookController.verifyGithubWebhook }), webhookController.handleGithubWebhook);

// GitLab webhooks
router.post('/gitlab', webhookController.handleGitlabWebhook);

// Jenkins webhooks
router.post('/jenkins', webhookController.handleJenkinsWebhook);

// CircleCI webhooks
router.post('/circleci', webhookController.handleCircleCIWebhook);

// Generic webhook for custom integrations
router.post('/generic/:pipelineId', webhookController.handleGenericWebhook);

module.exports = router;
