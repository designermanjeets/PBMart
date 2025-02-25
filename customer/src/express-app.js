const express = require('express');
const cors = require('cors');
const path = require('path');
const { customer, appEvents } = require('./api');
const errorHandler = require('./api/middlewares/error-handler');
const { CreateChannel } = require('./utils');
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
    try {
        const channel = await CreateChannel();
        
        // API with channel (which might be null)
        customer(app, channel);
    } catch (err) {
        logger.error('Failed to create channel:', err);
        // Still initialize API without messaging capabilities
        customer(app, null);
    }

    // Error handling middleware (should be last)
    app.use(errorHandler);
};
