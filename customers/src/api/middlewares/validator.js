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
 * Sanitize input to prevent XSS attacks
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize object to prevent XSS attacks
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  validateRequest,
  sanitizeInput,
  sanitizeObject
}; 