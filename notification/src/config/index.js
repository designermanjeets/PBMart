const dotEnv = require('dotenv');
const path = require('path');

if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV}`;
    dotEnv.config({ path: configFile });
} else {
    dotEnv.config();
}

module.exports = {
    PORT: process.env.PORT,
    DB_URL: process.env.MONGODB_URI,
    BASE_URL: process.env.BASE_URL,
    APP_SECRET: process.env.APP_SECRET,
    
    // Message Broker
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    QUEUE_NAME: process.env.QUEUE_NAME,
    NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE,
    CUSTOMERS_SERVICE: process.env.CUSTOMERS_SERVICE,
    SHOPPING_SERVICE: process.env.SHOPPING_SERVICE,
    PRODUCTS_SERVICE: process.env.PRODUCTS_SERVICE,
    TENANTS_SERVICE: process.env.TENANTS_SERVICE,
    ADMIN_SERVICE: process.env.ADMIN_SERVICE,
    PAYMENT_SERVICE: process.env.PAYMENT_SERVICE,
    
    // Email Configuration
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    
    // SMS Configuration
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    
    // Socket.IO Configuration
    SOCKET_IO_PORT: process.env.SOCKET_IO_PORT,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL
};