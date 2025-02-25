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

// Recursively sanitize all string values in an object
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        result[key] = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeObject(value);
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
};

// Middleware to validate and sanitize request body
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      // Sanitize input
      req.body = sanitizeObject(req.body);
      
      // Validate against schema
      const { error, value } = schema.validate(req.body, { abortEarly: false });
      
      if (error) {
        const errors = {};
        
        error.details.forEach((detail) => {
          const path = detail.path.join('.');
          errors[path] = detail.message;
        });
        
        logger.warn(`Validation error: ${JSON.stringify(errors)}`);
        throw new ValidationError('Validation failed', errors);
      }
      
      // Update req.body with validated and sanitized values
      req.body = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to validate and sanitize request params
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      // Sanitize input
      req.params = sanitizeObject(req.params);
      
      // Validate against schema
      const { error, value } = schema.validate(req.params, { abortEarly: false });
      
      if (error) {
        const errors = {};
        
        error.details.forEach((detail) => {
          const path = detail.path.join('.');
          errors[path] = detail.message;
        });
        
        logger.warn(`Validation error: ${JSON.stringify(errors)}`);
        throw new ValidationError('Validation failed', errors);
      }
      
      // Update req.params with validated and sanitized values
      req.params = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to validate and sanitize request query
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      // Sanitize input
      req.query = sanitizeObject(req.query);
      
      // Validate against schema
      const { error, value } = schema.validate(req.query, { abortEarly: false });
      
      if (error) {
        const errors = {};
        
        error.details.forEach((detail) => {
          const path = detail.path.join('.');
          errors[path] = detail.message;
        });
        
        logger.warn(`Validation error: ${JSON.stringify(errors)}`);
        throw new ValidationError('Validation failed', errors);
      }
      
      // Update req.query with validated and sanitized values
      req.query = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  sanitizeInput,
  sanitizeObject
}; 