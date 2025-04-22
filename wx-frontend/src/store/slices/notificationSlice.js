import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [
    // Mock data for development
    {
      id: '1',
      type: 'build_success',
      message: 'Build #123 completed successfully',
      pipelineId: 'pipeline1',
      buildId: 'build123',
      createdAt: new Date(Date.now() - 1800000),
      read: false
    },
    {
      id: '2',
      type: 'build_failure',
      message: 'Build #124 failed',
      pipelineId: 'pipeline2',
      buildId: 'build124',
      createdAt: new Date(Date.now() - 3600000),
      read: true
    },
    {
      id: '3',
      type: 'pipeline_created',
      message: 'New pipeline "Frontend CI" created',
      pipelineId: 'pipeline3',
      createdAt: new Date(Date.now() - 7200000),
      read: false
    }
  ],
  unreadCount: 2,
  loading: false,
  error: null,
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    fetchNotificationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(notification => !notification.read).length;
      state.loading = false;
      state.error = null;
    },
    fetchNotificationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action) => {
      const notificationToDelete = state.notifications.find(n => n.id === action.payload);
      if (notificationToDelete && !notificationToDelete.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
