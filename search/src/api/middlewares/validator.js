const { ValidationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('validator-middleware');

// Sanitize input to prevent XSS attacks
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Recursively sanitize an object
const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }
    
    return sanitizeInput(obj);
};

// Validate request body
const validateBody = (schema) => {
    return async (req, res, next) => {
        try {
            if (!schema) {
                return next();
            }

            const sanitizedBody = sanitizeObject(req.body);
            const { error, value } = schema.validate(sanitizedBody, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.reduce((acc, err) => {
                    acc[err.path[0]] = err.message;
                    return acc;
                }, {});
                
                throw new ValidationError('Invalid request data', errors);
            }

            req.body = value;
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Validate request parameters
const validateParams = (schema) => {
    return async (req, res, next) => {
        try {
            if (!schema) {
                return next();
            }

            const sanitizedParams = sanitizeObject(req.params);
            const { error, value } = schema.validate(sanitizedParams, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.reduce((acc, err) => {
                    acc[err.path[0]] = err.message;
                    return acc;
                }, {});
                
                throw new ValidationError('Invalid request parameters', errors);
            }

            req.params = value;
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Validate query parameters
const validateQuery = (schema) => {
    return async (req, res, next) => {
        try {
            if (!schema) {
                return next();
            }

            const sanitizedQuery = sanitizeObject(req.query);
            const { error, value } = schema.validate(sanitizedQuery, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.reduce((acc, err) => {
                    acc[err.path[0]] = err.message;
                    return acc;
                }, {});
                
                throw new ValidationError('Invalid query parameters', errors);
            }

            req.query = value;
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Validate request data against schema
const validateSchema = (schema, property) => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property]);
        
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            logger.warn(`Validation error: ${errorMessage}`);
            return next(new ValidationError(errorMessage));
        }
        
        next();
    };
};

module.exports = {
    validateBody,
    validateParams,
    validateQuery,
    sanitizeInput,
    sanitizeObject,
    validateSchema
}; 