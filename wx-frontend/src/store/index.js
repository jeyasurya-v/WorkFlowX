import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import organizationReducer from './slices/organizationSlice';
import notificationReducer from './slices/notificationSlice';
import featureAuthReducer from '../features/auth/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    organization: organizationReducer,
    notifications: notificationReducer,
    featureAuth: featureAuthReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['notifications/fetchNotificationsSuccess', 'notifications/addNotification'],
        ignoredActionPaths: ['payload.createdAt'],
        ignoredPaths: ['notifications.notifications'],
      },
    }),
});

export { store };
export default store;
