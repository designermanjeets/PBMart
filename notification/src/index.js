const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database/connection');
const expressApp = require('./express-app');
const { createLogger } = require('./utils/logger');
const logger = createLogger('server');

const StartServer = async () => {
    const app = express();

    await databaseConnection();
    
    await expressApp(app);

    app.listen(PORT, () => {
        logger.info(`Notification Service running on port ${PORT}`);
    }).on('error', (err) => {
        logger.error(`Error starting server: ${err.message}`);
        process.exit(1);
    });
};

StartServer();