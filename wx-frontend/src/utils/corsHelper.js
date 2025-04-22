/**
 * Utility functions to help detect and diagnose CORS issues
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8765/api/v1';

/**
 * Test a request to diagnose CORS issues
 * @param {string} endpoint - The API endpoint to test
 * @param {string} method - The HTTP method to use (GET, POST, etc.)
 * @param {object} data - The request body (for POST, PUT methods)
 * @returns {object} - Result object with success/error information
 */
export const testCorsRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const options = {
      method: method.toUpperCase(),
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, // Important for CORS with credentials
    };

    if (data && method.toUpperCase() !== 'GET') {
      options.data = data;
    }

    // First attempt the request
    const response = await axios(options);
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      cors: {
        withCredentials: true,
        headers: options.headers
      }
    };
  } catch (error) {
    const isCorsError = 
      error.message.includes('CORS') || 
      error.message.includes('Cross-Origin') ||
      error.message.includes('Access-Control-Allow-Origin');
    
    return {
      success: false,
      isCorsError,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      details: error.response?.data || error.toString(),
      request: {
        url,
        method,
        withCredentials: true,
        contentType: 'application/json'
      }
    };
  }
};

/**
 * Run a series of tests to diagnose CORS issues
 * @returns {object} - Diagnosis results
 */
export const diagnoseCorsIssues = async () => {
  const results = {
    health: null,
    withoutCredentials: null,
    options: null,
    browserInfo: {
      userAgent: navigator.userAgent,
      origin: window.location.origin
    }
  };
  
  const recommendations = [];
  
  // Test 1: Basic health check with credentials
  try {
    results.health = await testCorsRequest('/health', 'GET');
    if (!results.health.success) {
      if (results.health.isCorsError) {
        recommendations.push('The server may not have CORS properly configured for the health endpoint.');
      } else {
        recommendations.push(`Health endpoint failed with status ${results.health.status}: ${results.health.statusText}.`);
      }
    }
  } catch (error) {
    results.health = {
      success: false,
      error: error.message
    };
    recommendations.push('Cannot connect to the health endpoint. Check if the API server is running.');
  }
  
  // Test 2: Try without credentials
  try {
    const url = `${API_BASE_URL}/health`;
    const response = await axios({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false,
    });
    
    results.withoutCredentials = {
      success: true,
      status: response.status,
      statusText: response.statusText,
    };
    
    if (results.health?.success === false && results.withoutCredentials.success) {
      recommendations.push('Requests work without credentials but fail with credentials. Check Access-Control-Allow-Credentials header on the server.');
    }
  } catch (error) {
    results.withoutCredentials = {
      success: false,
      error: error.message
    };
  }
  
  // Test 3: OPTIONS preflight request
  try {
    const url = `${API_BASE_URL}/auth/login`;
    const response = await axios({
      method: 'OPTIONS',
      url,
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
        'Origin': window.location.origin
      }
    });
    
    results.options = {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  } catch (error) {
    results.options = {
      success: false,
      error: error.message
    };
    recommendations.push('OPTIONS preflight request failed. Check if the server handles OPTIONS requests correctly.');
  }
  
  // Check if environment variables are set correctly
  if (!process.env.REACT_APP_API_URL) {
    recommendations.push('REACT_APP_API_URL environment variable is not set in the frontend.');
  }
  
  // Auth test
  try {
    const authTestResult = await testCorsRequest('/auth/login', 'POST', { email: 'test@example.com', password: 'password' });
    results.auth = authTestResult;
    
    if (!authTestResult.success && authTestResult.isCorsError) {
      recommendations.push('Authentication endpoints have CORS issues. Check CORS configuration for POST methods.');
    }
  } catch (error) {
    results.auth = {
      success: false,
      error: error.message
    };
  }
  
  return {
    results,
    recommendations
  };
};

/**
 * Detect if an error is CORS related
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it appears to be a CORS error
 */
export const isCorsError = (error) => {
  if (!error) return false;
  
  const errorString = error.toString().toLowerCase();
  return (
    errorString.includes('cors') ||
    errorString.includes('cross-origin') ||
    errorString.includes('access-control-allow-origin') ||
    (error.response && error.response.status === 0)
  );
};

/**
 * Get CORS troubleshooting recommendations based on the error
 * @param {Error} error - The error to check
 * @returns {string[]} - Array of recommendations
 */
export const getCorsRecommendations = (error) => {
  if (!isCorsError(error)) {
    return [];
  }
  
  const recommendations = [
    'Check that the CORS_ORIGIN in your backend .env file includes your frontend origin',
    'Ensure the backend CORS middleware is properly configured',
    'Verify the withCredentials option is consistent between frontend and backend',
    'Check that credentials: "include" is set in your fetch requests or withCredentials: true in axios'
  ];
  
  return recommendations;
};

export default {
  testCorsRequest,
  diagnoseCorsIssues,
}; 