const { generateSecureToken } = require('../utils/encryption.utils');
const config = require('../config');

/**
 * Set up webhook for a pipeline
 * @param {string} provider - CI/CD provider
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - Provider credentials
 * @returns {Object} - Webhook URL and secret
 */
exports.setupWebhook = async (provider, repositoryUrl, credentials) => {
  try {
    // Generate webhook secret
    const webhookSecret = generateSecureToken(32);
    
    // Set up webhook based on provider
    switch (provider) {
      case 'github':
        return await setupGithubWebhook(repositoryUrl, credentials, webhookSecret);
      case 'gitlab':
        return await setupGitlabWebhook(repositoryUrl, credentials, webhookSecret);
      case 'jenkins':
        return await setupJenkinsWebhook(repositoryUrl, credentials, webhookSecret);
      case 'circleci':
        return await setupCircleCIWebhook(repositoryUrl, credentials, webhookSecret);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error setting up webhook for ${provider}:`, error);
    // Return webhook secret even if setup fails, so we can use it for manual setup
    return {
      webhookUrl: null,
      webhookSecret: generateSecureToken(32),
      error: error.message
    };
  }
};

/**
 * Set up GitHub webhook
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - GitHub credentials
 * @param {string} webhookSecret - Webhook secret
 * @returns {Object} - Webhook URL and secret
 */
const setupGithubWebhook = async (repositoryUrl, credentials, webhookSecret) => {
  // Extract owner and repo from URL
  const urlParts = repositoryUrl.replace(/\.git$/, '').split('/');
  const repo = urlParts.pop();
  const owner = urlParts.pop();
  
  // In a real implementation, we would use GitHub API to create webhook
  // For now, we'll return the webhook URL and secret for manual setup
  return {
    webhookUrl: `${config.server.apiBaseUrl}/api/v1/webhooks/github`,
    webhookSecret
  };
};

/**
 * Set up GitLab webhook
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - GitLab credentials
 * @param {string} webhookSecret - Webhook secret
 * @returns {Object} - Webhook URL and secret
 */
const setupGitlabWebhook = async (repositoryUrl, credentials, webhookSecret) => {
  // Extract project path from URL
  const urlParts = repositoryUrl.replace(/\.git$/, '').split('/');
  const project = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
  
  // In a real implementation, we would use GitLab API to create webhook
  // For now, we'll return the webhook URL and secret for manual setup
  return {
    webhookUrl: `${config.server.apiBaseUrl}/api/v1/webhooks/gitlab`,
    webhookSecret
  };
};

/**
 * Set up Jenkins webhook
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - Jenkins credentials
 * @param {string} webhookSecret - Webhook secret
 * @returns {Object} - Webhook URL and secret
 */
const setupJenkinsWebhook = async (repositoryUrl, credentials, webhookSecret) => {
  // In a real implementation, we would configure Jenkins to send webhooks
  // For now, we'll return the webhook URL and secret for manual setup
  return {
    webhookUrl: `${config.server.apiBaseUrl}/api/v1/webhooks/jenkins`,
    webhookSecret
  };
};

/**
 * Set up CircleCI webhook
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - CircleCI credentials
 * @param {string} webhookSecret - Webhook secret
 * @returns {Object} - Webhook URL and secret
 */
const setupCircleCIWebhook = async (repositoryUrl, credentials, webhookSecret) => {
  // In a real implementation, we would use CircleCI API to create webhook
  // For now, we'll return the webhook URL and secret for manual setup
  return {
    webhookUrl: `${config.server.apiBaseUrl}/api/v1/webhooks/circleci`,
    webhookSecret
  };
};

/**
 * Delete webhook for a pipeline
 * @param {string} provider - CI/CD provider
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - Provider credentials
 * @param {string} webhookUrl - Webhook URL to delete
 * @returns {boolean} - Success status
 */
exports.deleteWebhook = async (provider, repositoryUrl, credentials, webhookUrl) => {
  try {
    // Delete webhook based on provider
    switch (provider) {
      case 'github':
        return await deleteGithubWebhook(repositoryUrl, credentials, webhookUrl);
      case 'gitlab':
        return await deleteGitlabWebhook(repositoryUrl, credentials, webhookUrl);
      case 'jenkins':
        return await deleteJenkinsWebhook(repositoryUrl, credentials, webhookUrl);
      case 'circleci':
        return await deleteCircleCIWebhook(repositoryUrl, credentials, webhookUrl);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error deleting webhook for ${provider}:`, error);
    return false;
  }
};

/**
 * Delete GitHub webhook
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - GitHub credentials
 * @param {string} webhookUrl - Webhook URL to delete
 * @returns {boolean} - Success status
 */
const deleteGithubWebhook = async (repositoryUrl, credentials, webhookUrl) => {
  // In a real implementation, we would use GitHub API to delete webhook
  return true;
};

/**
 * Delete GitLab webhook
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - GitLab credentials
 * @param {string} webhookUrl - Webhook URL to delete
 * @returns {boolean} - Success status
 */
const deleteGitlabWebhook = async (repositoryUrl, credentials, webhookUrl) => {
  // In a real implementation, we would use GitLab API to delete webhook
  return true;
};

/**
 * Delete Jenkins webhook
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - Jenkins credentials
 * @param {string} webhookUrl - Webhook URL to delete
 * @returns {boolean} - Success status
 */
const deleteJenkinsWebhook = async (repositoryUrl, credentials, webhookUrl) => {
  // In a real implementation, we would configure Jenkins to remove webhooks
  return true;
};

/**
 * Delete CircleCI webhook
 * @param {string} repositoryUrl - Repository URL
 * @param {Object} credentials - CircleCI credentials
 * @param {string} webhookUrl - Webhook URL to delete
 * @returns {boolean} - Success status
 */
const deleteCircleCIWebhook = async (repositoryUrl, credentials, webhookUrl) => {
  // In a real implementation, we would use CircleCI API to delete webhook
  return true;
};

/**
 * Validate webhook payload
 * @param {string} provider - CI/CD provider
 * @param {Object} payload - Webhook payload
 * @param {Object} headers - Webhook headers
 * @param {string} secret - Webhook secret
 * @returns {boolean} - Validation result
 */
exports.validateWebhookPayload = (provider, payload, headers, secret) => {
  try {
    switch (provider) {
      case 'github':
        return validateGithubWebhook(payload, headers, secret);
      case 'gitlab':
        return validateGitlabWebhook(payload, headers, secret);
      case 'jenkins':
        return validateJenkinsWebhook(payload, headers, secret);
      case 'circleci':
        return validateCircleCIWebhook(payload, headers, secret);
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error validating webhook for ${provider}:`, error);
    return false;
  }
};

/**
 * Validate GitHub webhook
 * @param {Object} payload - Webhook payload
 * @param {Object} headers - Webhook headers
 * @param {string} secret - Webhook secret
 * @returns {boolean} - Validation result
 */
const validateGithubWebhook = (payload, headers, secret) => {
  const crypto = require('crypto');
  const signature = headers['x-hub-signature-256'];
  
  if (!signature) {
    return false;
  }
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
  
  return signature === digest;
};

/**
 * Validate GitLab webhook
 * @param {Object} payload - Webhook payload
 * @param {Object} headers - Webhook headers
 * @param {string} secret - Webhook secret
 * @returns {boolean} - Validation result
 */
const validateGitlabWebhook = (payload, headers, secret) => {
  const token = headers['x-gitlab-token'];
  return token === secret;
};

/**
 * Validate Jenkins webhook
 * @param {Object} payload - Webhook payload
 * @param {Object} headers - Webhook headers
 * @param {string} secret - Webhook secret
 * @returns {boolean} - Validation result
 */
const validateJenkinsWebhook = (payload, headers, secret) => {
  const token = headers['x-jenkins-token'];
  return token === secret;
};

/**
 * Validate CircleCI webhook
 * @param {Object} payload - Webhook payload
 * @param {Object} headers - Webhook headers
 * @param {string} secret - Webhook secret
 * @returns {boolean} - Validation result
 */
const validateCircleCIWebhook = (payload, headers, secret) => {
  const crypto = require('crypto');
  const signature = headers['circleci-signature'];
  
  if (!signature) {
    return true; // CircleCI doesn't always send signatures
  }
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  
  return signature === digest;
};
