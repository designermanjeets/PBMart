const { createLogger } = require('../utils/logger');
const { ValidationError } = require('../utils/errors');
const logger = createLogger('admin-app-events');
const UserAuth = require('./middlewares/auth');

module.exports = (app) => {
  app.use('/app-events', UserAuth.verifyToken, async (req, res, next) => {
    try {
      const { event, data } = req.body;
      
      if (!event) {
        throw new ValidationError('Event type is required');
      }
      
      logger.info(`Received event: ${event}`);
      
      // Process different event types
      let result;
      switch (event) {
        case 'USER_CREATED':
          logger.info(`Processing user created event for: ${data?.email || 'unknown user'}`);
          // Additional processing if needed
          result = { processed: true, event };
          break;
          
        case 'USER_UPDATED':
          logger.info(`Processing user updated event for ID: ${data?._id || 'unknown'}`);
          // Additional processing if needed
          result = { processed: true, event };
          break;
          
        case 'ORDER_CREATED':
          logger.info(`Processing order created event for ID: ${data?._id || 'unknown'}`);
          // Additional processing if needed
          result = { processed: true, event };
          break;
          
        case 'PRODUCT_UPDATED':
          logger.info(`Processing product updated event for ID: ${data?._id || 'unknown'}`);
          // Additional processing if needed
          result = { processed: true, event };
          break;
          
        default:
          logger.warn(`Unknown event type: ${event}`);
          result = { processed: false, event, message: 'Unknown event type' };
      }
      
      return res.json(result);
    } catch (error) {
      next(error);
    }
  });
}; 