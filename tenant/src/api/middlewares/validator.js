const { ValidationError } = require('../../utils/errors');

/**
 * Middleware to validate request data against a schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            if (!schema) {
                return next();
            }
            
            const { error } = schema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: true
            });
            
            if (error) {
                const message = error.details.map(detail => detail.message).join(', ');
                throw new ValidationError(message);
            }
            
            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = {
    validateRequest
}; 