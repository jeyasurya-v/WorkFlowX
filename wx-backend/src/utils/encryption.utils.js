const crypto = require('crypto');
const config = require('../config');

// Get encryption key from config
const getEncryptionKey = () => {
  return config.security.encryptionKey;
};

/**
 * Encrypt sensitive data
 * @param {Object|string} data - Data to encrypt
 * @returns {Object} - Encrypted data with iv
 */
exports.encryptCredentials = async (data) => {
  try {
    // Convert data to string if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher using AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
    
    // Encrypt the data
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return encrypted data with iv
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt credentials');
  }
};

/**
 * Decrypt sensitive data
 * @param {Object} encryptedData - Encrypted data object with iv
 * @returns {Object|string} - Decrypted data
 */
exports.decryptCredentials = async (encryptedData) => {
  try {
    // Extract iv and encrypted data
    const { iv, encryptedData: encrypted } = encryptedData;
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      getEncryptionKey(),
      Buffer.from(iv, 'hex')
    );
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Try to parse as JSON if possible
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      // Return as string if not valid JSON
      return decrypted;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt credentials');
  }
};

/**
 * Generate a random secure token
 * @param {number} length - Length of the token
 * @returns {string} - Random token
 */
exports.generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a string using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
exports.hashString = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Verify a webhook signature
 * @param {string} payload - Raw payload
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {boolean} - Whether signature is valid
 */
exports.verifyWebhookSignature = (payload, signature, secret, algorithm = 'sha256') => {
  const hmac = crypto.createHmac(algorithm, secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
};
