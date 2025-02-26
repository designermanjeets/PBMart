const amqplib = require('amqplib');
const { createLogger } = require('./logger');
const logger = createLogger('message-broker');
const { 
    MESSAGE_BROKER_URL, 
    EXCHANGE_NAME,
    QUEUE_NAME,
    NOTIFICATION_SERVICE
} = require('../config');

// Create a channel
module.exports.CreateChannel = async () => {
    try {
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        logger.info('Message broker channel created');
        return channel;
    } catch (err) {
        logger.error(`Error creating message broker channel: ${err.message}`);
        return null;
    }
};

// Publish message to channel
module.exports.PublishMessage = async (channel, service, msg) => {
    try {
        await channel.publish(EXCHANGE_NAME, service, Buffer.from(JSON.stringify(msg)));
        logger.info(`Message published to ${service}`);
    } catch (err) {
        logger.error(`Error publishing message: ${err.message}`);
        throw err;
    }
};

// Subscribe to messages
module.exports.SubscribeMessage = async (channel, service) => {
    try {
        const appQueue = await channel.assertQueue(QUEUE_NAME);
        
        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, NOTIFICATION_SERVICE);
        
        channel.consume(appQueue.queue, data => {
            if (data) {
                logger.info(`Received message from ${EXCHANGE_NAME}`);
                const message = JSON.parse(data.content.toString());
                service.SubscribeEvents(message);
                channel.ack(data);
            }
        });
    } catch (err) {
        logger.error(`Error subscribing to messages: ${err.message}`);
        throw err;
    }
};