import apiClient from './apiClient';

/**
 * Pipeline service for managing CI/CD pipelines
 */
const pipelineService = {
  /**
   * Get all pipelines for an organization
   * @param {string} organizationId - Organization ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - Pipelines
   */
  getOrganizationPipelines: async (organizationId, params = {}) => {
    const response = await apiClient.get(`/pipelines/organization/${organizationId}`, { params });
    return response.data.pipelines;
  },

  /**
   * Get pipeline by ID
   * @param {string} pipelineId - Pipeline ID
   * @returns {Promise<Object>} - Pipeline data
   */
  getPipelineById: async (pipelineId) => {
    const response = await apiClient.get(`/pipelines/${pipelineId}`);
    return response.data.pipeline;
  },

  /**
   * Create a new pipeline
   * @param {Object} pipelineData - Pipeline data
   * @returns {Promise<Object>} - Created pipeline
   */
  createPipeline: async (pipelineData) => {
    const response = await apiClient.post('/pipelines', pipelineData);
    return response.data.pipeline;
  },

  /**
   * Update a pipeline
   * @param {string} pipelineId - Pipeline ID
   * @param {Object} pipelineData - Pipeline data to update
   * @returns {Promise<Object>} - Updated pipeline
   */
  updatePipeline: async (pipelineId, pipelineData) => {
    const response = await apiClient.put(`/pipelines/${pipelineId}`, pipelineData);
    return response.data.pipeline;
  },

  /**
   * Delete a pipeline
   * @param {string} pipelineId - Pipeline ID
   * @returns {Promise<Object>} - Response data
   */
  deletePipeline: async (pipelineId) => {
    const response = await apiClient.delete(`/pipelines/${pipelineId}`);
    return response.data;
  },

  /**
   * Trigger a pipeline build
   * @param {string} pipelineId - Pipeline ID
   * @param {Object} buildData - Build data
   * @returns {Promise<Object>} - Build data
   */
  triggerBuild: async (pipelineId, buildData = {}) => {
    const response = await apiClient.post(`/pipelines/${pipelineId}/trigger`, buildData);
    return response.data.build;
  },

  /**
   * Get pipeline statistics
   * @param {string} pipelineId - Pipeline ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Pipeline statistics
   */
  getPipelineStatistics: async (pipelineId, params = {}) => {
    const response = await apiClient.get(`/analytics/pipelines/${pipelineId}`, { params });
    return response.data.statistics;
  },

  /**
   * Get pipeline health
   * @param {string} pipelineId - Pipeline ID
   * @returns {Promise<Object>} - Pipeline health data
   */
  getPipelineHealth: async (pipelineId) => {
    const response = await apiClient.get(`/analytics/pipelines/${pipelineId}/health`);
    return response.data.health;
  },

  /**
   * Test pipeline connection
   * @param {Object} connectionData - Connection data
   * @returns {Promise<Object>} - Connection test result
   */
  testConnection: async (connectionData) => {
    const response = await apiClient.post('/pipelines/test-connection', connectionData);
    return response.data;
  },

  /**
   * Get pipeline providers
   * @returns {Promise<Array>} - Available providers
   */
  getPipelineProviders: async () => {
    const response = await apiClient.get('/pipelines/providers');
    return response.data.providers;
  },

  /**
   * Get pipeline webhook URL
   * @param {string} pipelineId - Pipeline ID
   * @returns {Promise<Object>} - Webhook URL data
   */
  getPipelineWebhookUrl: async (pipelineId) => {
    const response = await apiClient.get(`/pipelines/${pipelineId}/webhook`);
    return response.data;
  },

  /**
   * Regenerate pipeline webhook secret
   * @param {string} pipelineId - Pipeline ID
   * @returns {Promise<Object>} - New webhook data
   */
  regenerateWebhookSecret: async (pipelineId) => {
    const response = await apiClient.post(`/pipelines/${pipelineId}/webhook/regenerate`);
    return response.data;
  }
};

export default pipelineService;
