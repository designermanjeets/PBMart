const logger = require('../../utils/logger');
const { ValidationError, AuthenticationError, NotFoundError } = require('../../utils/errors');

/**
 * Global error handling middleware
 */
module.exports = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    
    // Determine status code based on error type
    let statusCode = 500;
    let errorName = 'Internal Server Error';
    
    if (err instanceof ValidationError) {
        statusCode = 400;
        errorName = 'Validation Error';
    } else if (err instanceof AuthenticationError) {
        statusCode = 401;
        errorName = 'Authentication Error';
    } else if (err instanceof NotFoundError) {
        statusCode = 404;
        errorName = 'Not Found';
    }
    
    // Prepare response data
    const data = {
        error: errorName,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    
    res.status(statusCode).json(data);
}; 