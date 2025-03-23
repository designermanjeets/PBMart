const dotEnv = require('dotenv');

if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV}`;
    dotEnv.config({ path: configFile });
} else {
    dotEnv.config();
}

module.exports = {
    PORT: process.env.PORT,
    DB_URL: process.env.MONGODB_URI,
    APP_SECRET: process.env.APP_SECRET,
    BASE_URL: process.env.BASE_URL,
    
    // Message Broker
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    PAYMENT_SERVICE: process.env.PAYMENT_SERVICE,
    CUSTOMERS_SERVICE: process.env.CUSTOMERS_SERVICE,
    SHOPPING_SERVICE: process.env.SHOPPING_SERVICE,
    PRODUCTS_SERVICE: process.env.PRODUCTS_SERVICE,
    TENANTS_SERVICE: process.env.TENANTS_SERVICE,
    ADMIN_SERVICE: process.env.ADMIN_SERVICE,
    
    // Queue names
    QUEUE_NAME: process.env.QUEUE_NAME,
    
    // Payment Gateways
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL
}; 