/**
 * Logger utility for consistent log format across the application
 * Abstraction that can be replaced with a more sophisticated logging solution if needed
 */

const config = require('../config');

// Log levels in order of verbosity
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level from config
const currentLogLevel = config.logging.level.toUpperCase();

// Function to check if a message should be logged based on its level
const shouldLog = (messageLevel) => {
  return LOG_LEVELS[messageLevel] <= LOG_LEVELS[currentLogLevel];
};

// Format the message with timestamp, level, and optional context
const formatMessage = (level, message, context = '') => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  return `${timestamp} ${level} ${contextStr} ${message}`;
};

// Log to console and any other configured destinations
const logToDestinations = (formattedMessage) => {
  // Always log to console
  console.log(formattedMessage);
  
  // Here we could add other logging destinations like file or external service
  // based on configuration settings
  if (config.logging?.file?.enabled) {
    // Implement file logging if needed
    // const fs = require('fs');
    // fs.appendFileSync(config.logging.file.path, formattedMessage + '\n');
  }
};

/**
 * Error logging - for application errors that need immediate attention
 * @param {string} message - The error message
 * @param {object|Error} [error] - Optional error object
 * @param {string} [context] - Optional context identifier (e.g. function name)
 */
const error = (message, error, context) => {
  if (!shouldLog('ERROR')) return;
  
  let fullMessage = message;
  
  if (error) {
    if (error instanceof Error) {
      fullMessage += ` - ${error.message}`;
      if (config.logging.includeStackTrace) {
        fullMessage += `\n${error.stack}`;
      }
    } else {
      fullMessage += ` - ${JSON.stringify(error)}`;
    }
  }
  
  logToDestinations(formatMessage('ERROR', fullMessage, context));
};

/**
 * Warning logging - for important events that aren't errors
 * @param {string} message - The warning message
 * @param {string} [context] - Optional context identifier
 */
const warn = (message, context) => {
  if (!shouldLog('WARN')) return;
  logToDestinations(formatMessage('WARN', message, context));
};

/**
 * Info logging - for general application events
 * @param {string} message - The info message
 * @param {string} [context] - Optional context identifier
 */
const info = (message, context) => {
  if (!shouldLog('INFO')) return;
  logToDestinations(formatMessage('INFO', message, context));
};

/**
 * Debug logging - for detailed diagnostic information
 * @param {string} message - The debug message
 * @param {string} [context] - Optional context identifier
 */
const debug = (message, context) => {
  if (!shouldLog('DEBUG')) return;
  logToDestinations(formatMessage('DEBUG', message, context));
};

module.exports = {
  error,
  warn,
  info,
  debug
}; 