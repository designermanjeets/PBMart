module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI || 'mongodb://mongodb:27017/msytt_customer',
  APP_SECRET: process.env.APP_SECRET,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL || 'amqp://rabbitmq:5672',
  CUSTOMER_SERVICE: "customer_service",
  SHOPPING_SERVICE: "shopping_service",
};