const express = require('express');
const cors = require('cors');
const path = require('path');
const { search, setupRootRoutes } = require('./api');
const errorHandler = require('./api/middlewares/error-handler');
const { createChannel } = require('./utils/message-broker');
const { createLogger } = require('./utils/logger');
const logger = createLogger('express-app');

module.exports = async (app) => {
    try {
        // Create message broker channel
        let channel;
        try {
            channel = await createChannel();
        } catch (error) {
            logger.warn(`Failed to create message broker channel: ${error.message}`);
        }
        
        // Middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());
        
        // Health check endpoint
        app.get('/api/search/health', async (req, res) => {
            // Check Elasticsearch connection
            const esStatus = await require('./services/elasticsearch-service').checkConnection();
            
            // Check MongoDB connection if used
            const dbStatus = await require('./database/repository/search-repository').checkConnection();
            
            const status = {
                service: 'Search Service',
                uptime: process.uptime(),
                timestamp: new Date(),
                elasticsearch: esStatus ? 'connected' : 'disconnected',
                database: dbStatus ? 'connected' : 'disconnected'
            };
            
            const statusCode = esStatus ? 200 : 503;
            res.status(statusCode).json(status);
        });
        
        // API routes
        setupRootRoutes(app);
        app.use('/api/search', search(app, channel));
        
        // Static files (if needed)
        const staticDir = path.join(__dirname, 'public');
        app.use(express.static(staticDir));
        
        // 404 handler for undefined routes
        app.use('*', (req, res, next) => {
            const error = new Error(`Route ${req.originalUrl} not found`);
            error.statusCode = 404;
            next(error);
        });
        
        // Error handling
        app.use(errorHandler);
        
        logger.info('Express app configured');
    } catch (error) {
        logger.error(`Error configuring express app: ${error.message}`);
        throw error;
    }
}; 