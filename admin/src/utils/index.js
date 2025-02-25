const amqplib = require('amqplib');
const { createLogger } = require('./logger');
const { MESSAGE_BROKER_URL, EXCHANGE_NAME } = require('../config');

const logger = createLogger('message-broker');

// Create message broker channel
module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    logger.info('Message broker channel created');
    return channel;
  } catch (error) {
    logger.error(`Error creating channel: ${error.message}`);
    throw error;
  }
};

// Publish message to exchange
module.exports.PublishMessage = async (channel, service, msg) => {
  try {
    await channel.publish(EXCHANGE_NAME, service, Buffer.from(msg));
    logger.info(`Message published to ${service}`);
  } catch (error) {
    logger.error(`Error publishing message: ${error.message}`);
    throw error;
  }
};

// Subscribe to messages
module.exports.SubscribeMessage = async (channel, service, callback) => {
  try {
    const appQueue = await channel.assertQueue('QUEUE_NAME');
    
    channel.bindQueue(appQueue.queue, EXCHANGE_NAME, service);
    
    channel.consume(appQueue.queue, (data) => {
      logger.info(`Message received from ${service}`);
      callback(data.content.toString());
      channel.ack(data);
    });
  } catch (error) {
    logger.error(`Error subscribing to message: ${error.message}`);
    throw error;
  }
};

// Export token utilities
module.exports.generateToken = require('./token').generateToken;
module.exports.validateToken = require('./token').validateToken;
module.exports.generateRefreshToken = require('./token').generateRefreshToken; 