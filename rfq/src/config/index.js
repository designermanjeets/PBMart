const dotEnv = require('dotenv');

if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV}`;
    dotEnv.config({ path: configFile });
} else {
    dotEnv.config();
}

module.exports = {
    PORT: process.env.PORT,
    APP_SECRET: process.env.APP_SECRET,
    BASE_URL: process.env.BASE_URL,

    // Database
    MONGODB_URI: process.env.MONGODB_URI,
    
    // Message Broker
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    QUEUE_NAME: process.env.QUEUE_NAME,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL,
    
    // RFQ Settings
    RFQ_EXPIRY_DAYS: process.env.RFQ_EXPIRY_DAYS || 7,
    QUOTE_EXPIRY_DAYS: process.env.QUOTE_EXPIRY_DAYS || 14
}; 