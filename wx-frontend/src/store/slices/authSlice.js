import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { removeAuthToken } from '../../utils/tokenUtils';
import authService from '../../services/authService';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  isInitialized: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.isInitialized = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.isInitialized = true;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.isInitialized = true;
      state.error = null;
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.isInitialized = true;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.isInitialized = true;
      state.error = action.payload;
    },
    refreshTokenStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    refreshTokenSuccess: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.isInitialized = true;
      state.error = null;
    },
    refreshTokenFailure: (state, action) => {
      state.loading = false;
      state.isInitialized = true;
      state.error = action.payload;
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

// Action creators
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  updateUserProfile,
  setInitialized,
} = authSlice.actions;

// Thunk action to handle login
export const login = (userData) => (dispatch) => {
  dispatch(loginSuccess({
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
    },
    token: userData.token,
    refreshToken: userData.refreshToken,
  }));
  
  // Clear any logout flags
  localStorage.removeItem('just_logged_out');
};

// Thunk action to handle registration
export const register = (userData) => (dispatch) => {
  dispatch(registerSuccess({
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
    },
    token: userData.token,
    refreshToken: userData.refreshToken,
  }));
  
  // Clear any logout flags
  localStorage.removeItem('just_logged_out');
};

// Enhanced logout function that also calls the API
export const logoutAndCallApi = () => async (dispatch) => {
  try {
    console.log('Enhanced logout initiated');
    // First dispatch the synchronous logout action to update UI immediately
    dispatch(logout());
    
    // Then remove token to ensure user can't make more authenticated requests
    removeAuthToken();
    
    // Force isInitialized to true to prevent loader
    dispatch(setInitialized());
    
    // Finally try the API call, but don't block on it
    try {
      const response = await authService.logout();
      console.log('Logout API call successful:', response);
    } catch (apiError) {
      console.error('Logout API call failed, but UI is already updated:', apiError);
      // We don't rethrow - the UI is already in logged out state
    }
  } catch (error) {
    console.error('Critical error in enhanced logout:', error);
    // Last resort - make sure token is removed
    removeAuthToken();
    // Force isInitialized to true
    dispatch(setInitialized());
  }
};

export default authSlice.reducer;
