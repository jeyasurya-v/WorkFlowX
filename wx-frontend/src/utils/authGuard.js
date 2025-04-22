/**
 * Authentication guard utility functions
 * Provides security mechanisms to prevent unauthorized access
 */

import { store } from '../store';
import { isTokenExpired, getAuthToken, getRefreshToken } from './tokenUtils';

/**
 * Verify if the current session is valid
 * @returns {boolean} - True if session is valid, false otherwise
 */
export const verifySession = () => {
  try {
    // Check if tokens exist
    const token = getAuthToken();
    const refreshToken = getRefreshToken();
    
    // If no tokens, session is invalid
    if (!token && !refreshToken) {
      console.log('Session verification failed - no tokens found');
      return false;
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('Session verification failed - token is expired');
      
      // If refresh token is also expired, session is invalid
      if (!refreshToken || isTokenExpired(refreshToken)) {
        console.log('Refresh token is also expired or missing');
        return false;
      }
      
      // If refresh token is valid, we'll let the API interceptor handle refresh
      console.log('Access token expired but refresh token valid - will be refreshed on next API call');
      return true;
    }
    
    // Get auth state from Redux
    const state = store.getState();
    const isAuthenticated = state.auth?.isAuthenticated;
    
    // If Redux says not authenticated but we have tokens, state is inconsistent
    if (token && !isAuthenticated) {
      console.log('Session verification warning - tokens exist but Redux state is not authenticated');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying session:', error);
    return false;
  }
};

/**
 * Check if user has permission for a specific feature/page
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if user has permission, false otherwise
 */
export const hasPermission = (permission) => {
  try {
    if (!permission) return true;
    
    const state = store.getState();
    const user = state.auth?.user;
    
    if (!user) return false;
    
    // Check user role (simplified version)
    if (user.role === 'admin') return true;
    
    // For more complex permission checks, implement your own logic here
    // based on your permission model
    
    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

export default {
  verifySession,
  hasPermission
};
