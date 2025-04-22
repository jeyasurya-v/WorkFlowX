/**
 * Data Sanitization Utilities
 * 
 * Functions for sanitizing data before sending it to clients or storing it.
 * Removes sensitive fields and formats data for consistent responses.
 */

/**
 * Sanitize user object by removing sensitive fields
 * @param {Object} user - User document from database
 * @returns {Object} Sanitized user object
 */
exports.sanitizeUser = (user) => {
  if (!user) return null;
  
  // Convert mongoose document to plain object if needed
  const userObj = user.toObject ? user.toObject() : { ...user };
  
  // Remove sensitive fields
  delete userObj.password;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  delete userObj.emailVerificationToken;
  delete userObj.mfa?.secret;
  delete userObj.mfa?.backupCodes;
  
  // Remove sensitive OAuth data
  if (userObj.oauthProfiles && userObj.oauthProfiles.length > 0) {
    userObj.oauthProfiles = userObj.oauthProfiles.map(profile => {
      const { accessToken, refreshToken, ...safeProfile } = profile;
      return safeProfile;
    });
  }
  
  // Remove sensitive API keys data
  if (userObj.apiKeys && userObj.apiKeys.length > 0) {
    userObj.apiKeys = userObj.apiKeys.map(key => {
      const { key: apiKey, ...safeKey } = key;
      return safeKey;
    });
  }
  
  return userObj;
};

/**
 * Sanitize integration object by removing sensitive fields
 * @param {Object} integration - Integration document from database
 * @returns {Object} Sanitized integration object
 */
exports.sanitizeIntegration = (integration) => {
  if (!integration) return null;
  
  // Convert mongoose document to plain object if needed
  const integrationObj = integration.toObject ? integration.toObject() : { ...integration };
  
  // Remove sensitive fields
  delete integrationObj.apiToken;
  delete integrationObj.webhookSecret;
  
  // If config contains sensitive data, sanitize it
  if (integrationObj.config) {
    const config = { ...integrationObj.config };
    
    // Remove sensitive config fields
    delete config.privateKey;
    delete config.clientSecret;
    delete config.password;
    
    integrationObj.config = config;
  }
  
  return integrationObj;
};

/**
 * Sanitize organization object
 * @param {Object} organization - Organization document from database
 * @returns {Object} Sanitized organization object
 */
exports.sanitizeOrganization = (organization) => {
  if (!organization) return null;
  
  // Convert mongoose document to plain object if needed
  const orgObj = organization.toObject ? organization.toObject() : { ...organization };
  
  // Remove sensitive API keys
  if (orgObj.apiKeys && orgObj.apiKeys.length > 0) {
    orgObj.apiKeys = orgObj.apiKeys.map(key => {
      const { key: apiKey, ...safeKey } = key;
      return safeKey;
    });
  }
  
  return orgObj;
};

/**
 * Sanitize an array of items
 * @param {Array} items - Array of items to sanitize
 * @param {Function} sanitizeFn - Sanitization function to apply to each item
 * @returns {Array} Array of sanitized items
 */
exports.sanitizeArray = (items, sanitizeFn) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => sanitizeFn(item));
}; 