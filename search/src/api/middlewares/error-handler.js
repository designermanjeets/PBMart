const { AppError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('error-handler');

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    
    // If it's an operational error (expected error)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            ...(err.errors && { errors: err.errors })
        });
    }
    
    // For unexpected errors
    console.error(err);
    
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
};

module.exports = errorHandler; 