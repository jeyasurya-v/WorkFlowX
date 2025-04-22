import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { setAuthToken, removeAuthToken, getAuthToken } from '../../utils/tokenUtils';

// Initialize auth from local storage
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Initializing auth state');
      
      // Check for just_logged_out flag
      if (localStorage.getItem('just_logged_out') === 'true') {
        console.log('just_logged_out flag detected during initialization');
        localStorage.removeItem('just_logged_out');
        return null;
      }
      
      const token = getAuthToken();
      if (!token) {
        console.log('No token found, user is not authenticated');
        return null;
      }
      
      try {
        console.log('Token found, fetching current user');
        const user = await authService.getCurrentUser();
        console.log('Current user fetched successfully:', user);
        return user;
      } catch (apiError) {
        console.error('Failed to fetch current user with existing token:', apiError);
        removeAuthToken();
        return null;
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      removeAuthToken();
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize auth');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Login thunk - credentials:', { email: credentials.email });
      const response = await authService.login(credentials);
      console.log('Login thunk - received response');
      
      if (response.tokens && response.tokens.accessToken) {
        console.log('Setting auth token from login response');
        setAuthToken(response.tokens.accessToken, response.tokens.refreshToken);
        
        // Clear any logout flags
        localStorage.removeItem('just_logged_out');
        
        return response.user;
      } else {
        console.error('Login response missing tokens:', response);
        return rejectWithValue('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please check your credentials.'
      );
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Register thunk - userData:', { email: userData.email });
      const response = await authService.register(userData);
      console.log('Register thunk - received response');
      
      if (response.tokens && response.tokens.accessToken) {
        console.log('Setting auth token from register response');
        setAuthToken(response.tokens.accessToken, response.tokens.refreshToken);
        
        // Clear any logout flags
        localStorage.removeItem('just_logged_out');
        
        return response.user;
      } else {
        console.error('Register response missing tokens:', response);
        return rejectWithValue('Invalid response format from server');
      }
    } catch (error) {
      console.error('Register error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again later.'
      );
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('Logout thunk initiated');
      
      // First, remove tokens to ensure immediate UI update
      const tokensRemoved = removeAuthToken();
      console.log('Tokens removed:', tokensRemoved);
      
      // Set logout flag to prevent auto-login on page reload
      localStorage.setItem('just_logged_out', 'true');
      
      // Then try API call but don't block on it
      try {
        const response = await authService.logout();
        console.log('Logout API call successful:', response);
      } catch (apiError) {
        console.error('Logout API call failed, but continuing with local logout:', apiError);
        // We don't rethrow - local logout should succeed even if API fails
      }
      
      return null;
    } catch (error) {
      console.error('[ERROR] Critical error in logout thunk:', error);
      // Still try to remove token on error
      removeAuthToken();
      localStorage.setItem('just_logged_out', 'true');
      return rejectWithValue('Logout failed');
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      removeAuthToken();
      localStorage.setItem('just_logged_out', 'true');
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.isInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.isInitialized = true;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAuthError, clearAuth, setInitialized } = authSlice.actions;

export default authSlice.reducer;
