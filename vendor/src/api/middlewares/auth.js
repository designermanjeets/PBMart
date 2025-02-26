const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../../config');
const { AuthenticationError, AuthorizationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('auth-middleware');

// Validate JWT token
const validateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            throw new AuthenticationError('Authorization header is missing');
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            throw new AuthenticationError('Token is missing');
        }
        
        const decoded = jwt.verify(token, APP_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new AuthenticationError('Invalid token'));
        } else if (error.name === 'TokenExpiredError') {
            next(new AuthenticationError('Token has expired'));
        } else {
            next(error);
        }
    }
};

// Check if user has admin role
const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            throw new AuthenticationError('User not authenticated');
        }
        
        if (!req.user.roles || !req.user.roles.includes('admin')) {
            throw new AuthorizationError('Admin access required');
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateToken,
    isAdmin
}; 