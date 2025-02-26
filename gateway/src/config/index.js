const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: process.env.PORT || 8000,
  APP_SECRET: process.env.APP_SECRET || "your_app_secret",
  
  // Service URLs
  CUSTOMERS_SERVICE_URL: process.env.CUSTOMERS_SERVICE_URL || "http://customers:8001",
  PRODUCTS_SERVICE_URL: process.env.PRODUCTS_SERVICE_URL || "http://products:8002",
  SHOPPING_SERVICE_URL: process.env.SHOPPING_SERVICE_URL || "http://shopping:8003",
  TENANTS_SERVICE_URL: process.env.TENANTS_SERVICE_URL || "http://tenants:8004",
  ADMIN_SERVICE_URL: process.env.ADMIN_SERVICE_URL || "http://admin:8005",
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // 100 requests per window
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info"
}; 