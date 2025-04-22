import apiClient from './apiClient';

/**
 * Authentication service for handling user authentication
 */
const authService = {
  /**
   * Login user with email and password
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} - User data and tokens
   */
  login: async (credentials) => {
    try {
      console.log('AuthService login - sending request with credentials:', credentials);
      const response = await apiClient.post('/auth/login', credentials, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      console.log('AuthService login - received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService login - error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - User data and tokens
   */
  register: async (userData) => {
    try {
      console.log('AuthService register - sending request with userData:', userData);
      const response = await apiClient.post('/auth/register', userData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      console.log('AuthService register - received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService register - error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} - Logout response
   */
  logout: async () => {
    try {
      console.log('AuthService logout - sending request');
      const response = await apiClient.post('/auth/logout');
      console.log('AuthService logout - received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService logout - error:', error);
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} - User data
   */
  getCurrentUser: async () => {
    try {
      console.log('AuthService getCurrentUser - sending request');
      const response = await apiClient.get('/auth/me');
      console.log('AuthService getCurrentUser - received response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('AuthService getCurrentUser - error:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated user data
   */
  updateProfile: async (profileData) => {
    try {
      console.log('AuthService updateProfile - sending request with profileData:', profileData);
      const response = await apiClient.put('/users/profile', profileData);
      console.log('AuthService updateProfile - received response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('AuthService updateProfile - error:', error);
      throw error;
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password data
   * @returns {Promise<Object>} - Response data
   */
  changePassword: async (passwordData) => {
    try {
      console.log('AuthService changePassword - sending request');
      const response = await apiClient.put('/users/password', passwordData);
      console.log('AuthService changePassword - received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService changePassword - error:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {Object} emailData - Email data
   * @returns {Promise<Object>} - Response data
   */
  requestPasswordReset: async (emailData) => {
    try {
      console.log('AuthService requestPasswordReset - sending request with emailData:', emailData);
      const response = await apiClient.post('/auth/forgot-password', emailData);
      console.log('AuthService requestPasswordReset - received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService requestPasswordReset - error:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {Object} resetData - Reset data with token
   * @returns {Promise<Object>} - Response data
   */
  resetPassword: async (resetData) => {
    try {
      console.log('AuthService resetPassword - sending request with resetData:', resetData);
      const response = await apiClient.post('/auth/reset-password', resetData);
      console.log('AuthService resetPassword - received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService resetPassword - error:', error);
      throw error;
    }
  },

  /**
   * Update notification settings
   * @param {Object} settings - Notification settings
   * @returns {Promise<Object>} - Updated user data
   */
  updateNotificationSettings: async (settings) => {
    try {
      console.log('AuthService updateNotificationSettings - sending request with settings:', settings);
      const response = await apiClient.put('/users/notification-settings', settings);
      console.log('AuthService updateNotificationSettings - received response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('AuthService updateNotificationSettings - error:', error);
      throw error;
    }
  },

  /**
   * Initiate OAuth login
   * @param {string} provider - OAuth provider (github, gitlab)
   * @returns {string} - OAuth URL
   */
  getOAuthUrl: (provider) => {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8765/api/v1'}/auth/${provider}`;
  }
};

export default authService;
