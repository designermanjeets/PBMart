const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../config');
const { createLogger } = require('./logger');
const logger = createLogger('token-utils');

/**
 * Generate JWT token
 * @param {Object} payload - Data to be encoded in the token
 * @returns {Promise<string>} JWT token
 */
const generateToken = async (payload) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: '1d' });
  } catch (error) {
    logger.error(`Error generating token: ${error.message}`);
    throw error;
  }
};

/**
 * Validate JWT token
 * @param {string} token - JWT token to validate
 * @returns {Promise<Object|null>} Decoded token payload or null if invalid
 */
const validateToken = async (token) => {
  try {
    return jwt.verify(token, APP_SECRET);
  } catch (error) {
    logger.error(`Error validating token: ${error.message}`);
    return null;
  }
};

module.exports = {
  generateToken,
  validateToken
}; 