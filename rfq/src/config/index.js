const dotEnv = require('dotenv');

if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV}`;
    dotEnv.config({ path: configFile });
} else {
    dotEnv.config();
}

module.exports = {
    PORT: process.env.PORT || 8011,
    APP_SECRET: process.env.APP_SECRET,
    
    // Database
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://nosql-db:27017/rfq-service',
    
    // Message Broker
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL || 'amqp://rabbitmq:5672',
    EXCHANGE_NAME: process.env.EXCHANGE_NAME || 'B2B_EXCHANGE',
    QUEUE_NAME: process.env.QUEUE_NAME || 'rfq_queue',
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // RFQ Settings
    RFQ_EXPIRY_DAYS: process.env.RFQ_EXPIRY_DAYS || 7,
    QUOTE_EXPIRY_DAYS: process.env.QUOTE_EXPIRY_DAYS || 14
}; 