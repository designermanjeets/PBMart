const mongoose = require('mongoose');
const { DB_URL } = require('../config');
const { createLogger } = require('../utils/logger');
const logger = createLogger('database');

// Database connection
module.exports.databaseConnection = async () => {
    try {
        if (!DB_URL) {
            logger.info('No database URL provided, skipping MongoDB connection');
            return false;
        }
        
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        logger.info('Database connected');
        return true;
    } catch (error) {
        logger.error(`Error connecting to database: ${error.message}`);
        return false;
    }
};

// Check database connection
module.exports.checkConnection = async () => {
    try {
        if (!DB_URL) {
            return false;
        }
        
        return mongoose.connection.readyState === 1; // 1 = connected
    } catch (error) {
        logger.error(`Error checking database connection: ${error.message}`);
        return false;
    }
}; 