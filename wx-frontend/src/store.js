import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import socketReducer from './features/socket/socketSlice';
import pipelineReducer from './features/pipelines/pipelineSlice';
import buildReducer from './features/builds/buildSlice';
import organizationReducer from './features/organizations/organizationSlice';
import notificationReducer from './features/notifications/notificationSlice';
import themeReducer from './features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer,
    pipelines: pipelineReducer,
    builds: buildReducer,
    organizations: organizationReducer,
    notifications: notificationReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['socket/setSocket'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.socket'],
        // Ignore these paths in the state
        ignoredPaths: ['socket.socket'],
      },
    }),
});
