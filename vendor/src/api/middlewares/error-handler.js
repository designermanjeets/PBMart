const { AppError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('error-handler');

module.exports = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            errors: err.errors
        });
    }
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const errors = Object.keys(err.errors).reduce((acc, key) => {
            acc[key] = err.errors[key].message;
            return acc;
        }, {});
        
        return res.status(400).json({
            status: 'fail',
            message: 'Validation error',
            errors
        });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            status: 'fail',
            message: `Duplicate ${field}`,
            errors: {
                [field]: `${field} already exists`
            }
        });
    }
    
    // Handle other errors
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
}; 