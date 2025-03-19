const { validateToken: validateJWT } = require('../../utils/token');
const { AuthenticationError, AuthorizationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('auth-middleware');

/**
 * Middleware to validate JWT token
 */
const validateToken = async (req, res, next) => {
    try {
        // Get the authorization header
        const authorization = req.headers.authorization;
        
        if (!authorization) {
            throw new AuthenticationError('Authorization header is required');
        }
        
        // Extract the token
        const token = authorization.split(' ')[1];
        
        if (!token) {
            throw new AuthenticationError('Token is required');
        }
        
        // Verify the token
        const payload = await validateJWT(token);
        
        if (!payload) {
            throw new AuthenticationError('Invalid token');
        }
        
        // Check if token is expired
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            throw new AuthenticationError('Token has expired');
        }
        
        // Add the user to the request
        req.user = payload;
        
        // Log the user ID for debugging
        logger.info(`Authenticated user ID: ${payload._id}`);
        
        // Check if user is active
        if (payload.isActive === false) {
            throw new AuthorizationError('User account is inactive');
        }
        
        next();
    } catch (error) {
        logger.error(`Authentication error: ${error.message}`);
        next(error);
    }
};

module.exports = validateToken;