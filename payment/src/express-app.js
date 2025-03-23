const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { payment, setupRootRoutes } = require('./api');
const errorHandler = require('./api/middlewares/error-handler');
const { createChannel } = require('./utils/message-broker');
const { createLogger } = require('./utils/logger');
const logger = createLogger('express-app');

module.exports = async (app) => {
    try {
        // Middleware
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
        let channel = null;
        try {
            channel = await createChannel();
            if (!channel) {
                logger.warn("Message broker channel not available. Some functionality may be limited.");
            } else {
                logger.info("Message broker channel created successfully");
            }
        } catch (err) {
            logger.error(`Error creating message broker channel: ${err.message}`);
            logger.warn("Continuing without message broker functionality");
        }
        
        // Health check endpoint
        app.get('/health', async (req, res) => {
            try {
                // Check database connection
                const dbStatus = mongoose.connection.readyState === 1;
                
                // Check message broker connection
                const brokerStatus = channel ? 'connected' : 'disconnected';
                
                return res.status(200).json({
                    service: 'Payment Service',
                    status: 'active',
                    time: new Date(),
                    database: dbStatus ? 'connected' : 'disconnected',
                    messageBroker: brokerStatus
                });
            } catch (err) {
                return res.status(503).json({
                    service: 'Payment Service',
                    status: 'error',
                    time: new Date(),
                    error: err.message
                });
            }
        });
        
        // Setup root routes
        setupRootRoutes(app);
        
        // Setup API routes with prefix
        app.use('/api/payment', payment(app, channel));
        
        // Root route handler
        app.get('/', (req, res) => {
            res.status(200).json({
                message: 'Payment Service API',
                version: '1.0.0',
                endpoints: [
                    '/api/payment/create',
                    '/api/payment/process',
                    '/api/payment/verify',
                    '/api/payment/history',
                    '/api/payment/health'
                ]
            });
        });
        
        // Add a catch-all route for favicon.ico
        app.get('/favicon.ico', (req, res) => {
            res.status(204).end(); // No content response
        });
        
        // 404 handler
        app.use('*', (req, res, next) => {
            const error = new Error(`Route ${req.originalUrl} not found`);
            error.statusCode = 404;
            next(error);
        });
        
        // Error handling middleware (should be last)
        app.use(errorHandler);
        
        logger.info('Express app configured successfully');
    } catch (error) {
        logger.error(`Error configuring express app: ${error.message}`);
        throw error;
    }
}; 