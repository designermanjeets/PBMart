const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { PORT } = require('./config');
const routes = require('./routes');
const rateLimiter = require('./middleware/rate-limiter');
const errorHandler = require('./middleware/error-handler');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined')); // HTTP request logging
app.use(rateLimiter); // Rate limiting

// Add this near the top of the file
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Root path handler
app.get('/', (req, res) => {
  logger.info('Handling root path request');
  res.status(200).json({
    message: 'Welcome to the B2B eCommerce Platform',
    api: '/api'
  });
});

// Health check for the gateway itself at root level
app.get('/health', (req, res) => {
  logger.info('Handling health check request');
  const services = [
    { name: 'customers', url: CUSTOMERS_SERVICE },
    { name: 'products', url: PRODUCTS_SERVICE },
    { name: 'shopping', url: SHOPPING_SERVICE },
    { name: 'tenants', url: TENANTS_SERVICE },
    { name: 'admin', url: ADMIN_SERVICE },
    { name: 'payment', url: PAYMENT_SERVICE },
    { name: 'notification', url: NOTIFICATION_SERVICE },
    { name: 'search', url: SEARCH_SERVICE }
  ];
  res.status(200).json({
    service: 'API Gateway',
    status: 'active',
    time: new Date().toISOString(),
    services: services
  });
});

// API routes
app.use('/api', routes);

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Resource not found',
    path: req.originalUrl
  });
});

// Error handling
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
}); 