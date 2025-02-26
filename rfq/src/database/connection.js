const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('database-connection');

const databaseConnection = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info('Database connected successfully');
    } catch (error) {
        logger.error(`Database connection error: ${error.message}`);
        throw error;
    }
};

module.exports = { databaseConnection }; 