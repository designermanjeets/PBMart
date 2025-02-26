const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../../config');
const { AuthenticationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('auth-middleware');

// Validate JWT token
const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return next(new AuthenticationError('Authorization header is missing'));
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return next(new AuthenticationError('Token is missing'));
    }
    
    try {
        const decoded = jwt.verify(token, APP_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error(`Token validation failed: ${error.message}`);
        next(new AuthenticationError('Invalid token'));
    }
};

module.exports = {
    validateToken
}; 