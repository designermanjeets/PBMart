const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const amqplib = require("amqplib");
const logger = require("./logger");

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
    throw new Error("Data Not found!");
  }
};

//Raise Events
module.exports.PublishCustomerEvent = async (payload) => {
  axios.post("http://customer:8001/app-events/", {
    payload,
  });

  //     axios.post(`${BASE_URL}/customer/app-events/`,{
  //         payload
  //     });
};

module.exports.PublishShoppingEvent = async (payload) => {
  // axios.post('http://gateway:8000/shopping/app-events/',{
  //         payload
  // });

  axios.post(`http://shopping:8003/app-events/`, {
    payload,
  });
};

//Message Broker

module.exports.CreateChannel = async () => {
  let retries = 5;
  while (retries) {
    try {
      const connection = await amqplib.connect(MSG_QUEUE_URL);
      const channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, 'direct', false);
      console.log('Successfully connected to RabbitMQ');
      return channel;
    } catch (err) {
      console.log(`Error connecting to message broker (retries left: ${retries}):`, err.message);
      retries -= 1;
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  // After all retries, return null
  console.log('Failed to connect to RabbitMQ after multiple attempts');
  return null;
};

module.exports.PublishMessage = async (channel, service, msg) => {
  try {
    if (!channel) {
      console.log('Cannot publish message: Channel not available');
      return false;
    }
    
    await channel.publish(EXCHANGE_NAME, service, Buffer.from(JSON.stringify(msg)));
    return true;
  } catch (err) {
    console.log('Error publishing message:', err.message);
    return false;
  }
};

module.exports.SubscribeMessage = async (channel, service) => {
  try {
    if (!channel) {
      console.log('Channel not available for subscription');
      return;
    }
    
    const appQueue = await channel.assertQueue(EXCHANGE_NAME);
    
    channel.bindQueue(appQueue.queue, EXCHANGE_NAME, PRODUCT_SERVICE);
    
    channel.consume(appQueue.queue, data => {
      console.log('Received data in products service');
      console.log(data.content.toString());
      service.SubscribeEvents(JSON.parse(data.content.toString()));
      channel.ack(data);
    });
  } catch (err) {
    console.log('Error in subscription:', err.message);
  }
};
