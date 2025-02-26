const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database/connection');
const expressApp = require('./express-app');
const { subscribeMessage } = require('./utils/message-broker');
const { createLogger } = require('./utils/logger');
const VendorService = require('./services/vendor-service');

const logger = createLogger('index');

const startServer = async () => {
    try {
        const app = express();
        
        // Connect to database
        try {
            await databaseConnection();
            logger.info('Successfully connected to database');
        } catch (error) {
            logger.error(`Failed to connect to database: ${error.message}`);
            // Continue execution even if database connection fails
        }
        
        // Initialize express app
        await expressApp(app);
        
        // Start the server
        app.listen(PORT, () => {
            logger.info(`Vendor service running on port ${PORT}`);
        });
        
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer(); 