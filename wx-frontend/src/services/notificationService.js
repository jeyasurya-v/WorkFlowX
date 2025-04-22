import apiClient from './apiClient';

/**
 * Notification service for managing user notifications
 */
const notificationService = {
  /**
   * Get user notifications
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Notifications with unread count
   */
  getNotifications: async (params = {}) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Response data
   */
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} - Response data
   */
  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Response data
   */
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Get notification settings
   * @returns {Promise<Object>} - Notification settings
   */
  getSettings: async () => {
    const response = await apiClient.get('/notifications/settings');
    return response.data.settings;
  },

  /**
   * Update notification settings
   * @param {Object} settings - Notification settings
   * @returns {Promise<Object>} - Updated settings
   */
  updateSettings: async (settings) => {
    const response = await apiClient.put('/notifications/settings', settings);
    return response.data.settings;
  },

  /**
   * Subscribe to real-time notifications via WebSocket
   * @param {Object} socket - Socket.io instance
   * @param {Function} callback - Callback function for new notifications
   * @returns {Function} - Unsubscribe function
   */
  subscribeToNotifications: (socket, callback) => {
    socket.on('notification', callback);
    return () => {
      socket.off('notification', callback);
    };
  }
};

export default notificationService;
