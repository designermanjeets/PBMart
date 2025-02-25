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
  CUSTOMER_SERVICE_URL: process.env.CUSTOMER_SERVICE_URL || "http://customer:8001",
  PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL || "http://products:8002",
  SHOPPING_SERVICE_URL: process.env.SHOPPING_SERVICE_URL || "http://shopping:8003",
  TENANT_SERVICE_URL: process.env.TENANT_SERVICE_URL || "http://tenant:8004",
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // 100 requests per window
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info"
}; 