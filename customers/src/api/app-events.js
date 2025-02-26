const CustomerService = require("../services/customer-service");
const { ValidationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('customer-app-events');
const UserAuth = require('./middlewares/auth');

module.exports = (app) => {
    const service = new CustomerService();
    
    app.use('/app-events', UserAuth, async (req, res, next) => {
        try {
            const { event, data } = req.body;
            
            if (!event) {
                throw new ValidationError('Event type is required');
            }
            
            logger.info(`Received event: ${event}`);
            
            // Process different event types
            let result;
            switch (event) {
                case 'CUSTOMER_CREATED':
                    logger.info(`Processing customer created event for: ${data?.email || 'unknown customer'}`);
                    // Additional processing if needed
                    result = { processed: true, event };
                    break;
                    
                case 'CUSTOMER_UPDATED':
                    logger.info(`Processing customer updated event for ID: ${data?._id || 'unknown'}`);
                    // Additional processing if needed
                    result = { processed: true, event };
                    break;
                    
                case 'ADD_TO_WISHLIST':
                    logger.info(`Processing add to wishlist event for user: ${data?.userId || 'unknown'}`);
                    await service.SubscribeEvents(req.body);
                    result = { processed: true, event };
                    break;
                    
                case 'REMOVE_FROM_WISHLIST':
                    logger.info(`Processing remove from wishlist event for user: ${data?.userId || 'unknown'}`);
                    await service.SubscribeEvents(req.body);
                    result = { processed: true, event };
                    break;
                    
                case 'ADD_TO_CART':
                    logger.info(`Processing add to cart event for user: ${data?.userId || 'unknown'}`);
                    await service.SubscribeEvents(req.body);
                    result = { processed: true, event };
                    break;
                    
                case 'REMOVE_FROM_CART':
                    logger.info(`Processing remove from cart event for user: ${data?.userId || 'unknown'}`);
                    await service.SubscribeEvents(req.body);
                    result = { processed: true, event };
                    break;
                    
                default:
                    logger.warn(`Unknown event type: ${event}`);
                    result = { processed: false, message: 'Unknown event type' };
            }
            
            return res.status(200).json({
                success: true,
                message: `Event ${event} received`,
                data: result
            });
        } catch (error) {
            logger.error(`Error processing event: ${error.message}`);
            next(error);
        }
    });
};
