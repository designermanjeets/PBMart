const dotEnv = require('dotenv');

if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV}`;
    dotEnv.config({ path: configFile });
} else {
    dotEnv.config();
}

module.exports = {
    PORT: process.env.PORT || 8006,
    DB_URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/payment-service',
    APP_SECRET: process.env.APP_SECRET || 'payment_service_secret',
    BASE_URL: process.env.BASE_URL || 'http://localhost:8006',
    
    // Message Broker
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL || 'amqp://localhost',
    EXCHANGE_NAME: process.env.EXCHANGE_NAME || 'B2B_EXCHANGE',
    PAYMENT_SERVICE: 'payment_service',
    CUSTOMERS_SERVICE: 'customers_service',
    SHOPPING_SERVICE: 'shopping_service',
    PRODUCTS_SERVICE: 'products_service',
    TENANTS_SERVICE: 'tenants_service',
    ADMIN_SERVICE: 'admin_service',
    
    // Queue names
    QUEUE_NAME: 'payment_queue',
    
    // Payment Gateways
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
}; 