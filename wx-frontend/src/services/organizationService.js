import apiClient from './apiClient';

/**
 * Organization service for managing organizations
 */
const organizationService = {
  /**
   * Get user organizations
   * @returns {Promise<Array>} - User organizations
   */
  getUserOrganizations: async () => {
    const response = await apiClient.get('/organizations/me');
    return response.data.organizations;
  },

  /**
   * Get organization by ID
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} - Organization data
   */
  getOrganizationById: async (organizationId) => {
    const response = await apiClient.get(`/organizations/${organizationId}`);
    return response.data.organization;
  },

  /**
   * Create a new organization
   * @param {Object} organizationData - Organization data
   * @returns {Promise<Object>} - Created organization
   */
  createOrganization: async (organizationData) => {
    const response = await apiClient.post('/organizations', organizationData);
    return response.data.organization;
  },

  /**
   * Update an organization
   * @param {string} organizationId - Organization ID
   * @param {Object} organizationData - Organization data to update
   * @returns {Promise<Object>} - Updated organization
   */
  updateOrganization: async (organizationId, organizationData) => {
    const response = await apiClient.put(`/organizations/${organizationId}`, organizationData);
    return response.data.organization;
  },

  /**
   * Delete an organization
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} - Response data
   */
  deleteOrganization: async (organizationId) => {
    const response = await apiClient.delete(`/organizations/${organizationId}`);
    return response.data;
  },

  /**
   * Get organization members
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Array>} - Organization members
   */
  getOrganizationMembers: async (organizationId) => {
    const response = await apiClient.get(`/organizations/${organizationId}/members`);
    return response.data.members;
  },

  /**
   * Invite user to organization
   * @param {string} organizationId - Organization ID
   * @param {Object} inviteData - Invite data
   * @returns {Promise<Object>} - Invited member data
   */
  inviteUser: async (organizationId, inviteData) => {
    const response = await apiClient.post(`/organizations/${organizationId}/members`, inviteData);
    return response.data.member;
  },

  /**
   * Update member role
   * @param {string} organizationId - Organization ID
   * @param {string} userId - User ID
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} - Response data
   */
  updateMemberRole: async (organizationId, userId, roleData) => {
    const response = await apiClient.put(`/organizations/${organizationId}/members/${userId}`, roleData);
    return response.data;
  },

  /**
   * Remove member from organization
   * @param {string} organizationId - Organization ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Response data
   */
  removeMember: async (organizationId, userId) => {
    const response = await apiClient.delete(`/organizations/${organizationId}/members/${userId}`);
    return response.data;
  },

  /**
   * Leave organization
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} - Response data
   */
  leaveOrganization: async (organizationId) => {
    const response = await apiClient.post(`/organizations/${organizationId}/leave`);
    return response.data;
  },

  /**
   * Transfer organization ownership
   * @param {string} organizationId - Organization ID
   * @param {string} userId - New owner user ID
   * @returns {Promise<Object>} - Response data
   */
  transferOwnership: async (organizationId, userId) => {
    const response = await apiClient.post(`/organizations/${organizationId}/transfer-ownership`, { userId });
    return response.data;
  },

  /**
   * Get organization statistics
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} - Organization statistics
   */
  getOrganizationStatistics: async (organizationId) => {
    const response = await apiClient.get(`/analytics/organizations/${organizationId}`);
    return response.data.statistics;
  }
};

export default organizationService;
