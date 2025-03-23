const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');
const { createLogger } = require('./utils/logger');
const logger = createLogger('server');

const StartServer = async () => {
    const app = express();
    
    try {
        // Connect to database
        await databaseConnection();
        logger.info('Products Database Connected');
        
        // Configure express app
        await expressApp(app);
        
        // Start server
        app.listen(PORT, () => {
            logger.info(`Products service listening on port ${PORT}`);
        })
        .on('error', (err) => {
            logger.error(`Server error: ${err.message}`);
            process.exit(1);
        });
    } catch (error) {
        logger.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});

StartServer();
