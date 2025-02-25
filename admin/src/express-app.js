const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { admin, analytics, users, appEvents, setupRootRoutes } = require('./api');
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
        logger.info(`Headers: ${JSON.stringify(req.headers)}`);
        if (req.body && Object.keys(req.body).length > 0) {
            logger.info(`Body: ${JSON.stringify(req.body)}`);
        }
        next();
    });

    // Create message broker channel
    let channel;
    try {
        channel = await CreateChannel();
        logger.info('Message broker channel created successfully');
    } catch (err) {
        logger.error('Failed to create channel:', err);
        // Still initialize API without messaging capabilities
    }

    // Health check endpoint
    app.get('/health', async (req, res) => {
        try {
            // Check database connection
            const dbStatus = mongoose.connection.readyState === 1;
            
            // Check message broker connection
            const brokerStatus = channel ? 'connected' : 'disconnected';
            
            return res.status(200).json({
                service: 'Admin Service',
                status: 'active',
                time: new Date(),
                database: dbStatus ? 'connected' : 'disconnected',
                messageBroker: brokerStatus
            });
        } catch (err) {
            return res.status(503).json({
                service: 'Admin Service',
                status: 'error',
                time: new Date(),
                error: err.message
            });
        }
    });

    app.get('/health/gateway', async (req, res) => {
        try {
            const axios = require('axios');
            const response = await axios.get('http://gateway:8000/health', {
                timeout: 5000
            });
            res.status(200).json({
                status: 'ok',
                service: 'admin',
                gateway: response.data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                service: 'admin',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Setup root routes
    setupRootRoutes(app);
    
    // Setup API routes
    admin(app, channel);
    analytics(app, channel);
    users(app, channel);
    appEvents(app);

    // Add this before the error handler middleware
    app.use('*', (req, res, next) => {
        const error = new Error(`Route ${req.originalUrl} not found`);
        error.statusCode = 404;
        next(error);
    });

    // Error handling middleware (should be last)
    app.use(errorHandler);
}; 