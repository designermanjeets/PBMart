const express = require('express');
const cors = require('cors');
const path = require('path');
const { shopping, appEvents } = require('./api');
const { CreateChannel } = require('./utils');
const logger = require('./utils/logger');

module.exports = async (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.static(__dirname + '/public'))
 
    // Request logging middleware
    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.url}`);
        next();
    });

    // Create message broker channel
    try {
        const channel = await CreateChannel();
        
        // API with channel (which might be null)
        shopping(app, channel);
        // Listening to events
        appEvents(app);
    } catch (err) {
        logger.error('Failed to create channel:', err);
        // Still initialize API without messaging capabilities
        shopping(app, null);
        appEvents(app);
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
        logger.error(`Error: ${err.message}`);
        
        const statusCode = err.statusCode || 500;
        const data = {
            error: err.name || 'Internal Server Error',
            message: err.message || 'Something went wrong',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        };
        
        res.status(statusCode).json(data);
    });
};
