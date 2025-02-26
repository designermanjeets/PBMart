const amqplib = require('amqplib');
const { 
    MESSAGE_BROKER_URL, 
    EXCHANGE_NAME, 
    QUEUE_NAME 
} = require('../config');
const { createLogger } = require('./logger');
const logger = createLogger('message-broker');

// Create a channel
module.exports.createChannel = async () => {
    try {
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        
        // Use 'direct' exchange type to match existing exchange
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        
        logger.info('Message broker channel created');
        return channel;
    } catch (error) {
        logger.error(`Error creating message broker channel: ${error.message}`);
        throw error;
    }
};

// Subscribe to messages
module.exports.subscribeMessage = async (channel, service) => {
    try {
        const appQueue = await channel.assertQueue(QUEUE_NAME);
        
        // Bind to relevant events
        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, 'product.created');
        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, 'order.completed');
        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, 'review.created');
        
        channel.consume(appQueue.queue, data => {
            if (data) {
                const content = JSON.parse(data.content.toString());
                const routingKey = data.fields.routingKey;
                
                logger.info(`Received event: ${routingKey}`);
                
                // Map routing key to event type
                let event;
                switch (routingKey) {
                    case 'product.created':
                        event = 'PRODUCT_CREATED';
                        break;
                    case 'order.completed':
                        event = 'ORDER_COMPLETED';
                        break;
                    case 'review.created':
                        event = 'REVIEW_CREATED';
                        break;
                    default:
                        event = routingKey;
                }
                
                service.SubscribeEvents({ event, data: content });
                channel.ack(data);
            }
        });
    } catch (error) {
        logger.error(`Error subscribing to messages: ${error.message}`);
        throw error;
    }
};

// Publish message
module.exports.publishMessage = async (channel, routingKey, message) => {
    try {
        await channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
        logger.info(`Message published to ${routingKey}`);
    } catch (error) {
        logger.error(`Error publishing message: ${error.message}`);
        throw error;
    }
}; 