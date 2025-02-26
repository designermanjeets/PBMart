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
    } catch (error) {
        logger.error(`Error connecting to database: ${error.message}`);
        process.exit(1);
    }
}; 