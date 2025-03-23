const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../../config');
const { AuthenticationError, AuthorizationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const { validateToken } = require('../../utils/token');

const logger = createLogger('auth-middleware');

// List of routes that don't require authentication
const publicRoutes = [
    '/api/rfq/health',
    '/api/rfq/public'
];

const validateAuth = async (req, res, next) => {
    try {
        // Check if the route is public
        if (publicRoutes.some(route => req.path.startsWith(route))) {
            return next();
        }
        
        const token = req.headers.authorization;
        
        if (!token) {
            throw new AuthenticationError('No token provided');
        }
        
        // Extract the token from the Authorization header
        const tokenParts = token.split(' ');
        const tokenValue = tokenParts.length === 2 && tokenParts[0] === 'Bearer' ? tokenParts[1] : token;
        
        const payload = await validateToken(tokenValue);
        
        if (!payload) {
            throw new AuthenticationError('Invalid token');
        }
        
        req.user = payload;
        next();
    } catch (err) {
        logger.error(`Authentication error: ${err.message}`);
        next(err);
    }
};

const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.role || req.user.role !== 'admin') {
            throw new AuthorizationError('Admin access required');
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

const isBuyer = async (req, res, next) => {
    try {
        if (!req.user || !req.user.role || req.user.role !== 'buyer') {
            throw new AuthorizationError('Buyer access required');
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

const isVendor = async (req, res, next) => {
    try {
        if (!req.user || !req.user.role || req.user.role !== 'vendor') {
            throw new AuthorizationError('Vendor access required');
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateToken: validateAuth,
    isAdmin,
    isBuyer,
    isVendor
}; 