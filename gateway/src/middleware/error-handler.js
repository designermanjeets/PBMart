const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  
  // Log the stack trace in development
  if (process.env.NODE_ENV !== 'prod') {
    logger.error(err.stack);
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
}; 