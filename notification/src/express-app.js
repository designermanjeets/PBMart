const express = require('express');
const cors = require('cors');
const { notification, template, setupRootRoutes } = require('./api');
const { CreateChannel } = require('./utils');
const { createLogger } = require('./utils/logger');
const logger = createLogger('express-app');

module.exports = async (app) => {
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors());

    // Create message broker channel
    const channel = await CreateChannel();
    if (!channel) {
        logger.warn('Message broker channel not created. Some functionality may be limited.');
    } else {
        logger.info('Message broker channel created successfully');
    }

    // API routes
    setupRootRoutes(app);
    app.use('/api/notification', notification(app, channel));
    
    // Only add template routes if template is a function
    if (typeof template === 'function') {
        app.use('/api/notification/template', template(app));
    } else {
        logger.warn('Template API not properly defined. Template routes will not be available.');
    }

    // Root route handler
    app.get('/', (req, res) => {
        res.status(200).json({
            message: 'Notification Service API',
            version: '1.0.0',
            endpoints: [
                '/api/notification/email',
                '/api/notification/sms',
                '/api/notification/inapp',
                '/api/notification/user',
                '/api/notification/user/unread-count',
                '/api/notification/user/read-all',
                '/api/notification/:id',
                '/api/notification/:id/read',
                '/api/notification/template',
                '/api/notification/health'
            ]
        });
    });

    // Add a catch-all route for favicon.ico
    app.get('/favicon.ico', (req, res) => {
        res.status(204).end(); // No content response
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        logger.error(`Error: ${err.message}`);
        
        const statusCode = err.statusCode || 500;
        const errorResponse = {
            error: err.name || 'Error',
            message: err.message || 'Internal Server Error',
            ...(err.errors && { details: err.errors })
        };
        
        res.status(statusCode).json(errorResponse);
    });
}; 