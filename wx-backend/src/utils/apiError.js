/**
 * Custom API Error class
 * Extends the built-in Error class with additional properties for API error handling
 */

class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} errors - Additional error details
   */
  constructor(message, statusCode = 500, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.status = statusCode;
    this.isOperational = true; // Indicates if this is an operational error we can anticipate
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError; 