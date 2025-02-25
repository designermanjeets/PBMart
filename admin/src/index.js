const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');
const { createLogger } = require('./utils/logger');

const logger = createLogger('startup');

const StartServer = async () => {
    try {
        const app = express();
        
        // Connect to database first
        await databaseConnection();
        
        // Then set up the express app
        await expressApp(app);

        app.listen(PORT, () => {
            logger.info(`Admin service running on port ${PORT}`);
        })
        .on('error', (err) => {
            logger.error(`Error starting server: ${err.message}`);
            process.exit(1);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
}

StartServer(); 