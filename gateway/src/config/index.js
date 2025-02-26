const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: process.env.PORT || 8000,
  APP_SECRET: process.env.APP_SECRET,
  
  // Service URLs
  CUSTOMERS_SERVICE: process.env.CUSTOMERS_SERVICE,
  PRODUCTS_SERVICE: process.env.PRODUCTS_SERVICE,
  SHOPPING_SERVICE: process.env.SHOPPING_SERVICE,
  TENANTS_SERVICE: process.env.TENANTS_SERVICE,
  ADMIN_SERVICE: process.env.ADMIN_SERVICE,
  PAYMENT_SERVICE: process.env.PAYMENT_SERVICE,
  NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE,
  SEARCH_SERVICE: process.env.SEARCH_SERVICE || 'http://search:8009/api/search',
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info"
}; 