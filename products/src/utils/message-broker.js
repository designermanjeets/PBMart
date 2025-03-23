const amqplib = require("amqplib");
const { EXCHANGE_NAME, MESSAGE_BROKER_URL, QUEUE_NAME } = require("../config");
const { createLogger } = require("./logger");
const logger = createLogger("message-broker");

// Create a channel
module.exports.createChannel = async () => {
  try {
    logger.info(`Attempting to connect to RabbitMQ at ${MESSAGE_BROKER_URL}`);
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    
    // Use 'topic' exchange type to match existing exchange
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
    
    logger.info("Connected to RabbitMQ and channel created");
    return channel;
  } catch (error) {
    logger.error(`Error creating channel: ${error.message}`);
    return null; // Return null instead of throwing to allow service to continue
  }
};

// Publish message
module.exports.publishMessage = async (channel, routingKey, message) => {
  try {
    if (!channel) {
      logger.warn("Cannot publish message: Channel not available");
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

// Subscribe to messages
module.exports.subscribeMessage = async (channel, service) => {
  try {
    if (!channel) {
      logger.warn("Cannot subscribe to messages: Channel not available");
      return;
    }
    
    const appQueue = await channel.assertQueue(QUEUE_NAME);
    
    // Bind queue to exchange with appropriate routing keys
    const bindingKeys = [
      "product.created",
      "product.updated",
      "product.deleted",
      "category.created",
      "category.updated"
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
    
    logger.info(`Subscribed to ${bindingKeys.join(", ")} events`);
  } catch (error) {
    logger.error(`Error subscribing to messages: ${error.message}`);
  }
}; 