const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");
const logger = require("./logger");
const { AuthenticationError } = require('./errors');

const {
  APP_SECRET,
  BASE_URL,
  EXCHANGE_NAME,
  MSG_QUEUE_URL,
  MESSAGE_BROKER_URL,
  QUEUE_NAME,
  PRODUCT_SERVICE,
} = require("../config");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
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
    throw new Error('Data not found');
  }
};

//Raise Events
module.exports.PublishCustomerEvent = async (payload) => {
  console.log('Would publish to customer:', payload);
  // We'll implement this properly once dependencies are fixed
};

module.exports.PublishShoppingEvent = async (payload) => {
  console.log('Would publish to shopping:', payload);
  // We'll implement this properly once dependencies are fixed
};

//Message Broker

module.exports.CreateChannel = async () => {
  let retries = 5;
  while (retries) {
    try {
      const connection = await amqplib.connect(MESSAGE_BROKER_URL);
      const channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
      console.log("Successfully connected to RabbitMQ");
      return channel;
    } catch (err) {
      console.log(`Error connecting to message broker (retries left: ${retries}):`, err.message);
      retries -= 1;
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  // After all retries, return null
  console.log("Failed to connect to RabbitMQ after multiple attempts");
  return null;
};

module.exports.PublishMessage = async (channel, service, msg) => {
  try {
    if (!channel) {
      logger.warn('Channel not available for publishing message');
      return;
    }
    
    await channel.publish(EXCHANGE_NAME, service, Buffer.from(msg));
    logger.info(`Message published to service: ${service}`);
  } catch (err) {
    logger.error(`Error publishing message: ${err.message}`);
    throw err;
  }
};

module.exports.SubscribeMessage = async (channel, service, callback) => {
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

// Export token utilities
module.exports.GenerateToken = require('./token').generateToken;
module.exports.ValidateToken = require('./token').validateToken;
module.exports.GenerateRefreshToken = require('./token').generateRefreshToken;
