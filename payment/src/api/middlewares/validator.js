const { ValidationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('validator-middleware');

/**
 * Middleware to validate request body against a schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Express middleware function
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      if (!schema) {
        return next();
      }
      
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      
      if (error) {
        const errors = {};
        error.details.forEach(detail => {
          const key = detail.path[0];
          errors[key] = detail.message;
        });
        
        throw new ValidationError('Validation failed', errors);
      }
      
      // Replace request body with validated data
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware to validate request params against a schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Express middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      if (!schema) {
        return next();
      }
      
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true
      });
      
      if (error) {
        const errors = {};
        error.details.forEach(detail => {
          const key = detail.path[0];
          errors[key] = detail.message;
        });
        
        throw new ValidationError('Validation failed', errors);
      }
      
      // Replace request params with validated data
      req.params = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware to validate request query against a schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Express middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      if (!schema) {
        return next();
      }
      
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
      });
      
      if (error) {
        const errors = {};
        error.details.forEach(detail => {
          const key = detail.path[0];
          errors[key] = detail.message;
        });
        
        throw new ValidationError('Validation failed', errors);
      }
      
      // Replace request query with validated data
      req.query = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  validateRequest: validateBody // Alias for backward compatibility
}; 