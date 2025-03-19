module.exports = {
  PORT: process.env.PORT || 8001,
  DB_URL: process.env.MONGODB_URI || 'mongodb+srv://designermanjeets:U0N24OFr0g1CPHSs@xbusiness.hcn8v.mongodb.net/?retryWrites=true&w=majority&appName=Xbusiness',
  APP_SECRET: process.env.APP_SECRET || 'jg_youtube_tutorial',
  EXCHANGE_NAME: process.env.EXCHANGE_NAME || 'ONLINE_STORE',
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL || 'amqp://rabbitmq:5672',
  CUSTOMER_SERVICE: "customer_service",
  SHOPPING_SERVICE: "shopping_service",
  VERIFICATION_SERVICE: "verification_service",
};