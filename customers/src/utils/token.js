const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../config');
const { AuthenticationError } = require('./errors');
const { createLogger } = require('./logger');
const logger = createLogger('token-utility');

// Generate JWT token
const generateToken = async (payload) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: '1d' });
  } catch (error) {
    logger.error(`Error generating token: ${error.message}`);
    throw error;
  }
};

// Validate JWT token
const validateToken = async (token) => {
  try {
    return jwt.verify(token, APP_SECRET);
  } catch (error) {
    logger.error(`Error validating token: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token has expired');
    }
    
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }
    
    throw error;
  }
};

// Generate refresh token
const generateRefreshToken = async (payload) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: '7d' });
  } catch (error) {
    logger.error(`Error generating refresh token: ${error.message}`);
    throw error;
  }
};

module.exports = {
  generateToken,
  validateToken,
  generateRefreshToken
}; 