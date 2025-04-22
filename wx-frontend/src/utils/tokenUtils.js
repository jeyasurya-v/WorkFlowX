/**
 * Utility functions for handling JWT tokens
 */

// Token storage keys
const ACCESS_TOKEN_KEY = 'pipelineradar_access_token';
const REFRESH_TOKEN_KEY = 'pipelineradar_refresh_token';
const AUTH_TOKEN_KEY = 'pipelineradar_auth_token'; // For backward compatibility

/**
 * Set access token in localStorage
 * @param {string} token - JWT access token
 */
export const setAccessToken = (token) => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    console.log('Access token set successfully');
  } catch (error) {
    console.error('Error setting access token:', error);
  }
};

/**
 * Get access token from localStorage
 * @returns {string|null} - JWT access token or null if not found
 */
export const getAccessToken = () => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Set refresh token in localStorage
 * @param {string} token - JWT refresh token
 */
export const setRefreshToken = (token) => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    console.log('Refresh token set successfully');
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} - JWT refresh token or null if not found
 */
export const getRefreshToken = () => {
  try {
    const token = localStorage.getItem(REFRESH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    console.log('All tokens cleared successfully');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Parse JWT token to get payload
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const parseToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  try {
    const payload = parseToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Set both access and refresh tokens
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
export const setAuthToken = (accessToken, refreshToken) => {
  try {
    if (accessToken) {
      setAccessToken(accessToken);
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken); // For backward compatibility
    }
    
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    
    console.log('Auth tokens set successfully');
  } catch (error) {
    console.error('Error setting auth tokens:', error);
  }
};

/**
 * Get auth token (alias for getAccessToken)
 * @returns {string|null} - JWT auth token or null if not found
 */
export const getAuthToken = () => {
  try {
    // Try to get from ACCESS_TOKEN_KEY first, then fall back to AUTH_TOKEN_KEY
    const token = getAccessToken() || localStorage.getItem(AUTH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Remove all auth tokens
 */
export const removeAuthToken = () => {
  try {
    // Clear all tokens from localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    
    // Also clear any potential session cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('All tokens and cookies cleared successfully');
    
    // Return true to indicate success
    return true;
  } catch (error) {
    console.error('Error clearing tokens:', error);
    return false;
  }
};

/**
 * Store tokens in localStorage
 * @param {Object} tokens - Object containing access and refresh tokens
 */
export const storeTokens = (tokens) => {
  try {
    if (tokens.token) {
      setAccessToken(tokens.token);
    }
    
    if (tokens.refreshToken) {
      setRefreshToken(tokens.refreshToken);
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

/**
 * Get user data from token
 * @returns {Object|null} - User data from token or null if no valid token
 */
export const getUserFromToken = () => {
  try {
    const token = getAccessToken();
    if (!token) return null;
    
    const payload = parseToken(token);
    if (!payload) return null;
    
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

export default {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearTokens,
  parseToken,
  isTokenExpired,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  storeTokens,
  getUserFromToken
};
