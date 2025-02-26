const dotEnv = require('dotenv');

if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV}`;
    dotEnv.config({ path: configFile });
} else {
    dotEnv.config();
}

module.exports = {
    PORT: process.env.PORT || 8009,
    DB_URL: process.env.MONGODB_URI,
    APP_SECRET: process.env.APP_SECRET,
    
    // Message broker
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL || 'amqp://rabbitmq:5672',
    EXCHANGE_NAME: process.env.EXCHANGE_NAME || 'SEARCH_EXCHANGE',
    QUEUE_NAME: process.env.QUEUE_NAME || 'search_queue',
    
    // Service names
    SEARCH_SERVICE: 'search_service',
    
    // Elasticsearch
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200',
    ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME,
    ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD,
    ELASTICSEARCH_PRODUCT_INDEX: process.env.ELASTICSEARCH_PRODUCT_INDEX || 'products',
    ELASTICSEARCH_ANALYTICS_INDEX: process.env.ELASTICSEARCH_ANALYTICS_INDEX || 'search_analytics',
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
}; 