import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';
import toast from 'react-hot-toast';

// Get user notifications
export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchUserNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const notifications = await notificationService.getUserNotifications(params);
      return notifications;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { notifications } = getState().notifications;
      const unreadNotifications = notifications.filter(notification => !notification.read);
      
      // Mark each notification as read
      for (const notification of unreadNotifications) {
        await notificationService.markNotificationAsRead(notification.id);
      }
      
      return unreadNotifications.map(notification => notification.id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotificationError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      // Add new notification to the beginning of the list
      state.notifications.unshift(action.payload);
      
      // Increment unread count if notification is not read
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
      
      // Show toast notification
      const { title, severity } = action.payload;
      switch (severity) {
        case 'success':
          toast.success(title);
          break;
        case 'error':
          toast.error(title);
          break;
        case 'warning':
          toast.error(title);
          break;
        default:
          toast(title);
      }
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user notifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
        
        // Calculate unread count
        state.unreadCount = action.payload.notifications.filter(notification => !notification.read).length;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const notificationId = action.payload;
        
        // Update notification read status
        const notificationIndex = state.notifications.findIndex(
          notification => notification.id === notificationId
        );
        
        if (notificationIndex !== -1) {
          // Only decrement unread count if it was previously unread
          if (!state.notifications[notificationIndex].read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          
          state.notifications[notificationIndex].read = true;
          state.notifications[notificationIndex].readAt = new Date().toISOString();
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const notificationIds = action.payload;
        
        // Update all notifications in the list
        state.notifications.forEach(notification => {
          if (notificationIds.includes(notification.id)) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
          }
        });
        
        // Reset unread count
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetNotificationError,
  addNotification,
  updateUnreadCount
} = notificationSlice.actions;

export default notificationSlice.reducer;
