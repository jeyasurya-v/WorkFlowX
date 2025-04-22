import axios from 'axios';
import { getAuthToken, getRefreshToken, setAuthToken, removeAuthToken } from '../utils/tokenUtils';

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8765/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies and CORS
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  async (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error);
    
    // For debugging - log the full error
    console.log('Full error object:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    });
    
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if this is a logout request - don't retry these
      if (originalRequest.url === '/auth/logout') {
        console.log('Logout request failed with 401, not retrying');
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No refresh token, logout
          removeAuthToken();
          return Promise.reject(error);
        }
        
        // Call refresh token endpoint
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8765/api/v1'}/auth/refresh-token`, 
          { refreshToken },
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          }
        );
        
        // Update tokens
        const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
        setAuthToken(accessToken, newRefreshToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        console.error('Token refresh failed:', refreshError);
        removeAuthToken();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
