const mongoose = require('mongoose');
const { DB_URL } = require('../config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('database');

module.exports = {
    databaseConnection: async () => {
        try {
            logger.info(`Attempting to connect to MongoDB at: ${DB_URL}`);
            await mongoose.connect(DB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            logger.info('Database connected successfully');
        } catch (error) {
            logger.error(`Database connection error: ${error.message}`);
            process.exit(1);
        }
    },
    
    // Export models
    AdminModel: require('./models/Admin').AdminModel,
    RoleModel: require('./models/Role').RoleModel,
    
    // Export repositories
    AdminRepository: require('./repository/admin-repository'),
    AnalyticsRepository: require('./repository/analytics-repository')
}; 