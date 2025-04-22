import axios from 'axios';

/**
 * This file contains utility functions to test API connectivity
 * Run this in the browser console to debug API issues
 */

/**
 * Test the API connection
 * @param {string} baseUrl - The base URL of the API
 * @returns {Promise<Object>} - The response from the API
 */
export const testApiConnection = async (baseUrl = 'http://localhost:8765/api/v1') => {
  try {
    console.log(`Testing API connection to ${baseUrl}...`);
    const response = await axios.get(`${baseUrl}/health`);
    console.log('API connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API connection failed:', error);
    return { 
      success: false, 
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      } 
    };
  }
};

/**
 * Test the login API
 * @param {Object} credentials - The login credentials
 * @param {string} baseUrl - The base URL of the API
 * @returns {Promise<Object>} - The response from the API
 */
export const testLoginApi = async (credentials = { email: 'test@example.com', password: 'password' }, baseUrl = 'http://localhost:8765/api/v1') => {
  try {
    console.log(`Testing login API with credentials:`, credentials);
    const response = await axios.post(`${baseUrl}/auth/login`, credentials);
    console.log('Login API call successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login API call failed:', error);
    return { 
      success: false, 
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      } 
    };
  }
};

/**
 * Test the register API
 * @param {Object} userData - The user data for registration
 * @param {string} baseUrl - The base URL of the API
 * @returns {Promise<Object>} - The response from the API
 */
export const testRegisterApi = async (userData = { 
  firstName: 'Test', 
  lastName: 'User', 
  email: 'test@example.com', 
  password: 'password' 
}, baseUrl = 'http://localhost:8765/api/v1') => {
  try {
    console.log(`Testing register API with userData:`, userData);
    const response = await axios.post(`${baseUrl}/auth/register`, userData);
    console.log('Register API call successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Register API call failed:', error);
    return { 
      success: false, 
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      } 
    };
  }
};

// Export all test functions
const apiTest = {
  testApiConnection,
  testLoginApi,
  testRegisterApi
};

// Make it available in the browser console
if (typeof window !== 'undefined') {
  window.apiTest = apiTest;
}

export default apiTest;
