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
    APP_SECRET: process.env.APP_SECRET || 'your_jwt_secret_key',
    MESSAGE_BROKER_URL: process.env.MSG_QUEUE_URL,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    TENANTS_SERVICE: 'tenants_service',
    CUSTOMERS_SERVICE: 'customers_service',
    SHOPPING_SERVICE: 'shopping_service',
    QUEUE_NAME: 'TENANT_QUEUE'
}; 