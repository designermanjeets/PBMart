const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../config');
const { createLogger } = require('./logger');
const logger = createLogger('token-utils');

module.exports.generateToken = async (payload) => {
    try {
        return jwt.sign(payload, APP_SECRET, { expiresIn: '1d' });
    } catch (error) {
        logger.error(`Error generating token: ${error.message}`);
        throw error;
    }
};

module.exports.validateToken = async (token) => {
    try {
        return jwt.verify(token, APP_SECRET);
    } catch (error) {
        logger.error(`Error validating token: ${error.message}`);
        return null;
    }
}; 