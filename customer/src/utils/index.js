const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");
const logger = require("./logger");

const {
  APP_SECRET,
  EXCHANGE_NAME,
  CUSTOMER_SERVICE,
  MSG_QUEUE_URL,
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
    throw new Error("Data Not found!");
  }
};

//Message Broker
module.exports.CreateChannel = async () => {
  let retries = 5;
  while (retries) {
    try {
      const connection = await amqplib.connect(MSG_QUEUE_URL);
      const channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, "direct", false);
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
      logger.warn("Cannot publish message: Channel not available");
      return false;
    }
    
    await channel.publish(EXCHANGE_NAME, service, Buffer.from(JSON.stringify(msg)));
    return true;
  } catch (err) {
    logger.error(`Error publishing message: ${err.message}`);
    return false;
  }
};

module.exports.SubscribeMessage = async (channel, service) => {
  try {
    if (!channel) {
      console.log("Channel not available for subscription");
      return;
    }
    
    const appQueue = await channel.assertQueue("");
    
    channel.bindQueue(appQueue.queue, EXCHANGE_NAME, CUSTOMER_SERVICE);
    
    channel.consume(appQueue.queue, data => {
      console.log("Received data in customer service");
      console.log(data.content.toString());
      service.SubscribeEvents(JSON.parse(data.content.toString()));
      channel.ack(data);
    });
  } catch (err) {
    console.log("Error in subscription:", err.message);
  }
};
