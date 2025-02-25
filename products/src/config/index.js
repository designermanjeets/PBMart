const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
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
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL || 'amqp://rabbitmq:5672',
  QUEUE_NAME: process.env.QUEUE_NAME || 'product_queue',
  CUSTOMERS_SERVICE: process.env.CUSTOMERS_SERVICE || 'customers_service',
  SHOPPING_SERVICE: process.env.SHOPPING_SERVICE || 'shopping_service',
  PRODUCTS_SERVICE: process.env.PRODUCTS_SERVICE || 'products_service'
};
