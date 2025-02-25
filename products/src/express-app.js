const express = require("express");
const cors = require("cors");
const path = require("path");
const { products, appEvents } = require("./api");
const errorHandler = require('./api/middlewares/error-handler');

const { createChannel } = require("./utils/message-broker");
const logger = require('./utils/logger');

module.exports = async (app) => {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cors());
  app.use(express.static(__dirname + "/public"));

  // Request logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Create message broker channel
  let channel;
  try {
    channel = await createChannel();
    if (!channel) {
      logger.warn("Message broker channel not available. Some functionality may be limited.");
    } else {
      logger.info("Message broker channel created successfully");
    }
  } catch (err) {
    logger.error(`Error creating message broker channel: ${err.message}`);
    logger.info("Continuing without message broker functionality");
  }

  // API
  products(app, channel);
  
  // Error handling
  app.use(errorHandler);
};
