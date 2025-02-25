const dotEnv = require('dotenv');

if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV}`;
    dotEnv.config({ path: configFile });
} else {
    dotEnv.config();
}

module.exports = {
    PORT: process.env.PORT || 8004,
    DB_URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-service',
    APP_SECRET: process.env.APP_SECRET || 'admin_service_secret',
    BASE_URL: process.env.BASE_URL || 'http://localhost:8004',
    
    // Message Broker
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL || 'amqp://localhost',
    EXCHANGE_NAME: process.env.EXCHANGE_NAME || 'B2B_EXCHANGE',
    ADMIN_SERVICE: 'admin_service',
    CUSTOMER_SERVICE: 'customer_service',
    SHOPPING_SERVICE: 'shopping_service',
    PRODUCT_SERVICE: 'product_service',
    PAYMENT_SERVICE: 'payment_service',
    NOTIFICATION_SERVICE: 'notification_service',
    
    // Queue names
    QUEUE_NAME: 'admin_queue',
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Feature flags
    FEATURES: {
        MAX_ADMIN_USERS: process.env.MAX_ADMIN_USERS || 5,
        ANALYTICS_RETENTION_DAYS: process.env.ANALYTICS_RETENTION_DAYS || 30,
        ENABLE_ADVANCED_ANALYTICS: process.env.ENABLE_ADVANCED_ANALYTICS === 'true'
    }
}; 