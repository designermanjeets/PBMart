const amqplib = require("amqplib");
const { EXCHANGE_NAME, MESSAGE_BROKER_URL, QUEUE_NAME } = require("../config");
const logger = require("./logger");

// Create a channel with retry logic
const createChannel = async () => {
  let retries = 5;
  while (retries) {
    try {
      logger.info(`Attempting to connect to RabbitMQ at ${MESSAGE_BROKER_URL}`);
      const connection = await amqplib.connect(MESSAGE_BROKER_URL);
      const channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
      logger.info("Successfully connected to RabbitMQ");
      return channel;
    } catch (err) {
      logger.warn(`Error connecting to message broker (retries left: ${retries}): ${err.message}`);
      retries -= 1;
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  // After all retries, return null
  logger.error("Failed to connect to RabbitMQ after multiple attempts");
  return null;
};

// Publish a message to a service
const publishMessage = async (channel, service, msg) => {
  try {
    if (!channel) {
      logger.warn('Channel not available for publishing message');
      return;
    }
    
    await channel.publish(EXCHANGE_NAME, service, Buffer.from(typeof msg === 'string' ? msg : JSON.stringify(msg)));
    logger.info(`Message published to service: ${service}`);
  } catch (err) {
    logger.error(`Error publishing message: ${err.message}`);
    throw err;
  }
};

// Subscribe to messages from a service
const subscribeMessage = async (channel, service, callback) => {
  try {
    if (!channel) {
      logger.warn('Channel not available for subscribing to messages');
      return;
    }
    
    const appQueue = await channel.assertQueue(QUEUE_NAME);
    
    channel.bindQueue(appQueue.queue, EXCHANGE_NAME, service);
    
    channel.consume(appQueue.queue, (data) => {
      logger.info(`Received data from ${service}`);
      callback(data.content.toString());
      channel.ack(data);
    });
  } catch (err) {
    logger.error(`Error subscribing to message: ${err.message}`);
    throw err;
  }
};

module.exports = {
  createChannel,
  publishMessage,
  subscribeMessage
}; 