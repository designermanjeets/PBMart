const express = require('express');
const router = express.Router();
const { 
  CUSTOMERS_SERVICE, 
  SHOPPING_SERVICE, 
  PRODUCTS_SERVICE, 
  TENANTS_SERVICE, 
  ADMIN_SERVICE,
  PAYMENT_SERVICE,
  NOTIFICATION_SERVICE
} = require('../config');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { validateToken } = require('../middleware');

// Root path handler
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the B2B eCommerce API Gateway',
    version: '1.0.0',
    services: [
      { name: 'Products', endpoint: '/api/products' },
      { name: 'Customers', endpoint: '/api/customers' },
      { name: 'Shopping', endpoint: '/api/shopping' },
      { name: 'Tenants', endpoint: '/api/tenants' },
      { name: 'Admin', endpoint: '/api/admin' },
      { name: 'Payment', endpoint: '/api/payment' },
      { name: 'Notification', endpoint: '/api/notification' }
    ],
    documentation: '/api/docs'
  });
});

// Health check for the gateway itself
router.get('/health', async (req, res) => {
  try {
    return res.status(200).json({
      service: 'API Gateway',
      status: 'active',
      time: new Date(),
      database: 'N/A', // Gateway doesn't have a database
      messageBroker: 'N/A' // Gateway doesn't connect to message broker
    });
  } catch (err) {
    return res.status(503).json({
      service: 'API Gateway',
      status: 'error',
      time: new Date(),
      error: err.message
    });
  }
});

// Customer Service Routes
router.use('/customers', validateToken, createProxyMiddleware({
  target: CUSTOMERS_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/customers': '/api/customers'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request to customer service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error to customer service:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Shopping Service Routes
router.use('/shopping', validateToken, createProxyMiddleware({
  target: SHOPPING_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/shopping': '/api/shopping'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request to shopping service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error to shopping service:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Product Service Routes
router.use('/products', validateToken, createProxyMiddleware({
  target: PRODUCTS_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/products': '/api/products'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request to products service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error to products service:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Tenant Service Routes
router.use('/tenants', validateToken, createProxyMiddleware({
  target: TENANTS_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/tenants': '/api/tenants'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request to tenant service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error to tenant service:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Admin Service Routes - Protected endpoints (token required)
router.use('/admin', validateToken, createProxyMiddleware({
  target: ADMIN_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/admin': '/api/admin'
  }
}));

// Payment Service Routes
router.use('/payment', validateToken, createProxyMiddleware({
  target: PAYMENT_SERVICE,
  changeOrigin: true,
  pathRewrite: {  
    '^/payment': '/api/payment'
  }
}));

// Check if NOTIFICATION_SERVICE is properly imported and used
console.log('NOTIFICATION_SERVICE:', NOTIFICATION_SERVICE);

// Notification Service Routes
router.use('/notification', validateToken, createProxyMiddleware({
  target: NOTIFICATION_SERVICE,
  changeOrigin: true,
  pathRewrite: {  
    '^/notification': '/api/notification'
  }
}));

module.exports = router; 