const { createLogger } = require('../../utils/logger');
const { AppError } = require('../../utils/errors');

const logger = createLogger('error-handler');

module.exports = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    
    // If it's an operational error, send the defined status code and message
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            errors: err.errors
        });
    }
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const errors = {};
        
        Object.keys(err.errors).forEach(key => {
            errors[key] = err.errors[key].message;
        });
        
        return res.status(400).json({
            status: 'fail',
            message: 'Validation error',
            errors
        });
    }
    
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'fail',
            message: `Invalid ${err.path}: ${err.value}`
        });
    }
    
    // Handle duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            status: 'fail',
            message: `Duplicate field value: ${field}. Please use another value.`
        });
    }
    
    // For all other errors, send a generic error message
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
}; 