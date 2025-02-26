const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../../config');
const { AuthenticationError, AuthorizationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('auth-middleware');

module.exports = {
    validateToken: async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new AuthenticationError('No token provided');
            }
            
            const token = authHeader.split(' ')[1];
            
            if (!token) {
                throw new AuthenticationError('No token provided');
            }
            
            try {
                const decoded = jwt.verify(token, APP_SECRET);
                req.user = decoded;
                next();
            } catch (error) {
                throw new AuthenticationError('Invalid token');
            }
        } catch (error) {
            next(error);
        }
    },
    
    isAdmin: async (req, res, next) => {
        try {
            if (!req.user || !req.user.role || req.user.role !== 'admin') {
                throw new AuthorizationError('Admin access required');
            }
            
            next();
        } catch (error) {
            next(error);
        }
    },
    
    isBuyer: async (req, res, next) => {
        try {
            if (!req.user || !req.user.role || req.user.role !== 'buyer') {
                throw new AuthorizationError('Buyer access required');
            }
            
            next();
        } catch (error) {
            next(error);
        }
    },
    
    isVendor: async (req, res, next) => {
        try {
            if (!req.user || !req.user.role || req.user.role !== 'vendor') {
                throw new AuthorizationError('Vendor access required');
            }
            
            next();
        } catch (error) {
            next(error);
        }
    }
}; 