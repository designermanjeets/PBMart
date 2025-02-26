const mongoose = require('mongoose');
const { DB_URL } = require('../config');
const { createLogger } = require('../utils/logger');
const logger = createLogger('database');

module.exports.databaseConnection = async () => {
    try {
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('Database Connected');
        return true;
    } catch (error) {
        logger.error(`Error connecting to database: ${error.message}`);
        return false;
    }
};

module.exports.checkConnection = async () => {
    try {
        return mongoose.connection.readyState === 1; // 1 = connected
    } catch (error) {
        logger.error(`Error checking database connection: ${error.message}`);
        return false;
    }
}; 