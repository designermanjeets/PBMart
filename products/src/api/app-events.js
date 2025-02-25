const ProductService = require("../services/product-service");
const { ValidationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('product-app-events');
const UserAuth = require('./middlewares/auth');

module.exports = (app) => {
    const service = new ProductService();
    
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
                case 'PRODUCT_CREATED':
                    logger.info(`Processing product created event for: ${data?.name || 'unknown product'}`);
                    // Additional processing if needed
                    result = { processed: true, event };
                    break;
                    
                case 'PRODUCT_UPDATED':
                    logger.info(`Processing product updated event for ID: ${data?._id || 'unknown'}`);
                    // Additional processing if needed
                    result = { processed: true, event };
                    break;
                    
                case 'PRODUCT_DELETED':
                    logger.info(`Processing product deleted event for ID: ${data?._id || 'unknown'}`);
                    // Additional processing if needed
                    result = { processed: true, event };
                    break;
                    
                case 'ADD_TO_WISHLIST':
                case 'REMOVE_FROM_WISHLIST':
                case 'ADD_TO_CART':
                case 'REMOVE_FROM_CART':
                    logger.info(`Processing ${event} event`);
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
