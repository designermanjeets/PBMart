const { ValidationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('validator-middleware');

// Middleware to validate request data against a Joi schema
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const errors = {};
      
      error.details.forEach((detail) => {
        const path = detail.path.join('.');
        errors[path] = detail.message;
      });
      
      logger.warn(`Validation error: ${JSON.stringify(errors)}`);
      return next(new ValidationError('Validation error', errors));
    }
    
    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

module.exports = {
  validateRequest
}; 