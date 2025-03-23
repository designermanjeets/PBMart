const dotEnv = require('dotenv');
const path = require('path');

// Log the current environment
console.log('Current NODE_ENV:', process.env.NODE_ENV);

// Default to 'dev' if NODE_ENV is not set
const environment = process.env.NODE_ENV || 'dev';
console.log('Using environment:', environment);

// Construct the path to the env file
const configFile = path.resolve(`./.env.${environment}`);
console.log('Loading config from:', configFile);

// Load environment variables
dotEnv.config({ path: configFile });

// Log loaded configuration
console.log('Loaded environment variables:', {
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_FROM: process.env.EMAIL_FROM
});

module.exports = {
    PORT: process.env.PORT || 8007,
    DB_URL: process.env.MONGODB_URI || 'mongodb://nosql-db:27017/notification-service',
    APP_SECRET: process.env.APP_SECRET || 'notification_service_secret',
    
    // Message Broker
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL || 'amqp://localhost',
    EXCHANGE_NAME: process.env.EXCHANGE_NAME || 'B2B_EXCHANGE',
    QUEUE_NAME: process.env.QUEUE_NAME || 'notification_queue',
    NOTIFICATION_SERVICE: 'notification_service',
    CUSTOMERS_SERVICE: 'customers_service',
    SHOPPING_SERVICE: 'shopping_service',
    PRODUCTS_SERVICE: 'products_service',
    TENANTS_SERVICE: 'tenants_service',
    ADMIN_SERVICE: 'admin_service',
    PAYMENT_SERVICE: 'payment_service',
    
    // Email Configuration
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'smtp',
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_USER: process.env.EMAIL_USER || 'your_email@example.com',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'your_email_password',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@b2b-ecommerce.com',
    
    // SMS Configuration
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    
    // Socket.IO Configuration
    SOCKET_IO_PORT: process.env.SOCKET_IO_PORT || 8008,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// Add this for debugging
console.log('Email configuration:', {
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_FROM: process.env.EMAIL_FROM
});