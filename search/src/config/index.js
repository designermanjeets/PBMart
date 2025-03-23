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
    // Message broker
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    QUEUE_NAME: process.env.QUEUE_NAME,
    
    // Service names
    SEARCH_SERVICE: process.env.SEARCH_SERVICE,
    
    // Elasticsearch
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE,
    ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME,
    ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD,
    ELASTICSEARCH_PRODUCT_INDEX: process.env.ELASTICSEARCH_PRODUCT_INDEX,
    ELASTICSEARCH_ANALYTICS_INDEX: process.env.ELASTICSEARCH_ANALYTICS_INDEX,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL
}; 