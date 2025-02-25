const { validateToken } = require('../../utils/token');
const { AuthenticationError, AuthorizationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('auth-middleware');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = await validateToken(token);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    next(error);
  }
};

// Middleware to check if user has required permissions
const hasPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const { permissions } = req.user;
      
      if (!permissions) {
        throw new AuthorizationError('User has no permissions');
      }
      
      // Check if user has all required permissions
      const hasAllPermissions = Array.isArray(requiredPermissions)
        ? requiredPermissions.every(permission => permissions.includes(permission))
        : permissions.includes(requiredPermissions);
      
      if (!hasAllPermissions) {
        throw new AuthorizationError('You do not have permission to perform this action');
      }
      
      next();
    } catch (error) {
      logger.error(`Authorization error: ${error.message}`);
      next(error);
    }
  };
};

module.exports = {
  verifyToken,
  hasPermission
}; 