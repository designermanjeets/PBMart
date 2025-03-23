const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const amqplib = require('amqplib');
const logger = require('./logger');

const { APP_SECRET, MESSAGE_BROKER_URL, EXCHANGE_NAME, QUEUE_NAME, TENANT_SERVICE } = require('../config');

// Utility functions
module.exports.GenerateSalt = async () => {
    return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (enteredPassword, savedPassword) => {
    return await bcrypt.compare(enteredPassword, savedPassword);
};

module.exports.GenerateSignature = async (payload) => {
    try {
        return await jwt.sign(payload, APP_SECRET, { expiresIn: '1d' });
    } catch (error) {
        console.log(error);
        return error;
    }
};

module.exports.ValidateSignature = async (req) => {
    try {
        const signature = req.get('Authorization');
        
        if (!signature) {
            return false;
        }
        
        const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
        req.user = payload;
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

module.exports.FormateData = (data) => {
    if (data) {
        return { data };
    } else {
        throw new Error('Data Not found!');
    }
};

// Message Broker
module.exports.CreateChannel = async () => {
    try {
        logger.info(`Attempting to connect to RabbitMQ at ${MESSAGE_BROKER_URL}`);
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        
        // Use 'topic' exchange type to match existing exchange
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
        
        logger.info('Connected to RabbitMQ and channel created');
        return channel;
    } catch (error) {
        logger.error(`Error creating channel: ${error.message}`);
        return null; // Return null instead of throwing to allow service to continue
    }
};

module.exports.PublishMessage = async (channel, routingKey, message) => {
    try {
        if (!channel) {
            logger.warn('Cannot publish message: Channel not available');
            return;
        }
        
        await channel.publish(
            EXCHANGE_NAME,
            routingKey,
            Buffer.from(JSON.stringify(message))
        );
        logger.info(`Message published to ${routingKey}`);
    } catch (error) {
        logger.error(`Error publishing message: ${error.message}`);
    }
};

module.exports.SubscribeMessage = async (channel, service) => {
    try {
        if (!channel) {
            logger.warn('Cannot subscribe to messages: Channel not available');
            return;
        }
        
        const appQueue = await channel.assertQueue(QUEUE_NAME);
        
        // Bind queue to exchange with appropriate routing keys
        const bindingKeys = [
            'tenant.created',
            'tenant.updated',
            'tenant.deleted',
            'user.created',
            'user.updated'
        ];
        
        for (const key of bindingKeys) {
            await channel.bindQueue(appQueue.queue, EXCHANGE_NAME, key);
        }
        
        channel.consume(appQueue.queue, data => {
            if (data) {
                try {
                    const message = JSON.parse(data.content.toString());
                    service.SubscribeEvents(message);
                    channel.ack(data);
                } catch (error) {
                    logger.error(`Error processing message: ${error.message}`);
                    channel.nack(data, false, false); // Don't requeue
                }
            }
        });
        
        logger.info(`Subscribed to ${bindingKeys.join(', ')} events`);
    } catch (error) {
        logger.error(`Error subscribing to messages: ${error.message}`);
    }
}; 