import apiClient from './apiClient';

/**
 * Build service for managing CI/CD pipeline builds
 */
const buildService = {
  /**
   * Get builds for a pipeline
   * @param {string} pipelineId - Pipeline ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Builds with pagination
   */
  getPipelineBuilds: async (pipelineId, params = {}) => {
    const response = await apiClient.get(`/builds/pipeline/${pipelineId}`, { params });
    return response.data;
  },

  /**
   * Get build by ID
   * @param {string} buildId - Build ID
   * @returns {Promise<Object>} - Build data
   */
  getBuildById: async (buildId) => {
    const response = await apiClient.get(`/builds/${buildId}`);
    return response.data.build;
  },

  /**
   * Get build logs
   * @param {string} buildId - Build ID
   * @returns {Promise<string>} - Build logs
   */
  getBuildLogs: async (buildId) => {
    const response = await apiClient.get(`/builds/${buildId}/logs`);
    return response.data.logs;
  },

  /**
   * Retry a build
   * @param {string} buildId - Build ID
   * @returns {Promise<Object>} - New build data
   */
  retryBuild: async (buildId) => {
    const response = await apiClient.post(`/builds/${buildId}/retry`);
    return response.data.build;
  },

  /**
   * Cancel a build
   * @param {string} buildId - Build ID
   * @returns {Promise<Object>} - Response data
   */
  cancelBuild: async (buildId) => {
    const response = await apiClient.post(`/builds/${buildId}/cancel`);
    return response.data;
  },

  /**
   * Add comment to a build
   * @param {string} buildId - Build ID
   * @param {string} message - Comment message
   * @returns {Promise<Object>} - Response with comments
   */
  addBuildComment: async (buildId, message) => {
    const response = await apiClient.post(`/builds/${buildId}/comments`, { message });
    return response.data;
  },

  /**
   * Get build artifacts
   * @param {string} buildId - Build ID
   * @returns {Promise<Array>} - Build artifacts
   */
  getBuildArtifacts: async (buildId) => {
    const response = await apiClient.get(`/builds/${buildId}/artifacts`);
    return response.data.artifacts;
  },

  /**
   * Download build artifact
   * @param {string} buildId - Build ID
   * @param {string} artifactId - Artifact ID
   * @returns {Promise<Blob>} - Artifact file
   */
  downloadArtifact: async (buildId, artifactId) => {
    const response = await apiClient.get(`/builds/${buildId}/artifacts/${artifactId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Compare two builds
   * @param {string} buildId1 - First build ID
   * @param {string} buildId2 - Second build ID
   * @returns {Promise<Object>} - Comparison data
   */
  compareBuilds: async (buildId1, buildId2) => {
    const response = await apiClient.get(`/builds/compare`, {
      params: { build1: buildId1, build2: buildId2 }
    });
    return response.data.comparison;
  },

  /**
   * Get build statistics
   * @param {string} pipelineId - Pipeline ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Build statistics
   */
  getBuildStatistics: async (pipelineId, params = {}) => {
    const response = await apiClient.get(`/analytics/builds/pipeline/${pipelineId}`, { params });
    return response.data.statistics;
  }
};

export default buildService;
