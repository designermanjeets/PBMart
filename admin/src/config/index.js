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
    BASE_URL: process.env.BASE_URL,
    APP_SECRET: process.env.APP_SECRET,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    MSG_BROKER_URL: process.env.MSG_BROKER_URL,
    CUSTOMER_SERVICE: process.env.CUSTOMER_SERVICE,
    SHOPPING_SERVICE: process.env.SHOPPING_SERVICE,
    VERIFICATION_SERVICE: process.env.VERIFICATION_SERVICE,
    LOG_LEVEL: process.env.LOG_LEVEL,
    QUEUE_NAME: process.env.QUEUE_NAME,
    FEATURES: {
        MAX_ADMIN_USERS: process.env.MAX_ADMIN_USERS || 5,
        ANALYTICS_RETENTION_DAYS: process.env.ANALYTICS_RETENTION_DAYS || 30,
        ENABLE_ADVANCED_ANALYTICS: process.env.ENABLE_ADVANCED_ANALYTICS === 'true'
    }
}; 