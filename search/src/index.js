const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database/connection');
const expressApp = require('./express-app');
const { createLogger } = require('./utils/logger');
const logger = createLogger('server');
const ElasticsearchService = require('./services/elasticsearch-service');

const StartServer = async () => {
    const app = express();
    
    try {
        // Connect to database if needed
        const dbConnected = await databaseConnection();
        if (!dbConnected) {
            logger.info('Database connection skipped or failed, but continuing startup');
        }
        
        // Initialize Elasticsearch connection
        const esService = new ElasticsearchService();
        const esConnected = await esService.initializeConnection();
        
        if (!esConnected) {
            logger.warn('Failed to connect to Elasticsearch, but continuing startup');
        }
        
        // Configure express app
        await expressApp(app);
        
        // Start server
        app.listen(PORT, () => {
            logger.info(`Search Service running on port ${PORT}`);
        }).on('error', (err) => {
            logger.error(`Error starting server: ${err.message}`);
            process.exit(1);
        });
        
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`UNCAUGHT EXCEPTION: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`UNHANDLED REJECTION: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});

StartServer(); 