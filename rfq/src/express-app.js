const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { createChannel } = require('./utils/message-broker');
const { createLogger } = require('./utils/logger');
const api = require('./api');
const errorHandler = require('./api/middlewares/error-handler');

const logger = createLogger('express-app');

module.exports = async (app) => {
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors());
    app.use(express.static(path.join(__dirname, 'public')));
    
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

    app.get('/rfq', (req, res) => {
        res.status(200).json({
            message: 'RFQ Service API - Test Route',
            version: '1.0.0',
            endpoints: [
                { method: 'GET', path: '/api/rfqs', description: 'Get all RFQs' },
                { method: 'POST', path: '/api/rfqs', description: 'Create a new RFQ' },
                { method: 'GET', path: '/api/rfqs/:id', description: 'Get RFQ by ID' }
            ]
        });
    });

    // Health check endpoint
    app.get('/health', async (req, res) => {
        try {
            // Check database connection
            const dbStatus = mongoose.connection.readyState === 1;
            
            // Check message broker connection
            const brokerStatus = channel ? 'connected' : 'disconnected';
            
            return res.status(200).json({
                service: 'RFQ Service',
                status: 'active',
                time: new Date(),
                database: dbStatus ? 'connected' : 'disconnected',
                messageBroker: brokerStatus
            });
        } catch (err) {
            return res.status(503).json({
                service: 'RFQ Service',
                status: 'error',
                time: new Date(),
                error: err.message
            });
        }
    });

    // Add a simple root endpoint
    app.get('/', (req, res) => {
        res.status(200).json({
            message: 'RFQ Service API',
            version: '1.0.0'
        });
    });
    
    // Initialize API routes
    api(app, channel);

    // Add this before the error handler middleware
    app.use('*', (req, res, next) => {
        const error = new Error(`Route ${req.originalUrl} not found`);
        error.statusCode = 404;
        next(error);
    });

    // Error handling middleware (should be last)
    app.use(errorHandler);
}; 