const amqplib = require('amqplib');
const { MESSAGE_BROKER_URL, EXCHANGE_NAME, QUEUE_NAME } = require('../config');
const { createLogger } = require('./logger');

const logger = createLogger('message-broker');

// Create a channel
const createChannel = async () => {
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

// Publish message
const publishMessage = async (channel, routingKey, message) => {
    try {
        await channel.publish(
            EXCHANGE_NAME,
            routingKey,
            Buffer.from(JSON.stringify(message))
        );
        logger.info(`Message published to ${routingKey}`);
    } catch (error) {
        logger.error(`Error publishing message: ${error.message}`);
        throw error;
    }
};

// Subscribe to messages
const subscribeMessage = async (channel, service) => {
    try {
        const appQueue = await channel.assertQueue(QUEUE_NAME);
        
        // Bind to events
        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, 'rfq.created');
        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, 'rfq.updated');
        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, 'quote.submitted');
        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, 'quote.accepted');
        
        channel.consume(appQueue.queue, (data) => {
            if (data) {
                const message = JSON.parse(data.content.toString());
                const { event, payload } = message;
                
                logger.info(`Received event: ${event}`);
                
                switch (event) {
                    case 'rfq.created':
                        service.SubscribeEvents(event, payload);
                        break;
                    case 'rfq.updated':
                        service.SubscribeEvents(event, payload);
                        break;
                    case 'quote.submitted':
                        service.SubscribeEvents(event, payload);
                        break;
                    case 'quote.accepted':
                        service.SubscribeEvents(event, payload);
                        break;
                    default:
                        logger.warn(`No handler for event: ${event}`);
                }
                
                channel.ack(data);
            }
        });
        
        logger.info('Subscribed to message broker events');
    } catch (error) {
        logger.error(`Error subscribing to messages: ${error.message}`);
        throw error;
    }
};

module.exports = {
    createChannel,
    publishMessage,
    subscribeMessage
}; 