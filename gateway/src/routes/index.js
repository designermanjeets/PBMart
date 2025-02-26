const express = require('express');
const router = express.Router();
const { 
  CUSTOMERS_SERVICE, 
  SHOPPING_SERVICE, 
  PRODUCTS_SERVICE, 
  TENANTS_SERVICE, 
  ADMIN_SERVICE,
  PAYMENT_SERVICE,
  NOTIFICATION_SERVICE,
  SEARCH_SERVICE,
  VENDOR_SERVICE_URL,
  RFQ_SERVICE_URL
} = require('../config');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { validateToken } = require('../middleware');
const axios = require('axios');
const circuitBreaker = require('../utils/circuitBreaker');

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
      { name: 'Notification', endpoint: '/api/notification' },
      { name: 'Search', endpoint: '/api/search' },
      { name: 'Vendor', endpoint: '/api/vendors' },
      { name: 'Verification', endpoint: '/api/verification' }
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


// Notification Service Routes
router.use('/notification', validateToken, createProxyMiddleware({
  target: NOTIFICATION_SERVICE,
  changeOrigin: true,
  pathRewrite: {  
    '^/notification': '/api/notification'
  }
}));

// Vendor Service Routes - Remove validateToken for testing
router.use('/vendor', createProxyMiddleware({
  target: VENDOR_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/vendor': '/api/vendor'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request to vendor service: ${req.method} ${req.url}`);
    console.log(`Target URL: ${VENDOR_SERVICE_URL}/api/vendor${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error to vendor service:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Add Verification routes
router.use('/verification', validateToken, createProxyMiddleware({
  target: VENDOR_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/verification': '/api/verifications'
  }
}));

// Search Service Routes
router.use('/search', circuitBreaker.createCircuitBreaker(
    async (req, res, next) => {
        try {
            const { method, path, query, body, headers } = req;
            const authHeader = headers.authorization;
            
            const response = await axios({
                method,
                url: `${SEARCH_SERVICE}${path}`,
                params: query,
                data: body,
                headers: authHeader ? { Authorization: authHeader } : {}
            });
            
            return res.status(response.status).json(response.data);
        } catch (error) {
            next(error);
        }
    },
    'search-service'
));


// RFQ Service Routes
router.use('/rfq', createProxyMiddleware({
  target: RFQ_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/rfq': '/api/rfqs'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request to RFQ service: ${req.method} ${req.url}`);
    console.log(`Target URL: ${RFQ_SERVICE_URL}/api/rfqs${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error to RFQ service:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Add Quote routes
router.use('/quotes', createProxyMiddleware({
  target: RFQ_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/quotes': '/api/quotes'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request to Quote service: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error to Quote service:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Add RFQ health check
router.get('/rfq-health', async (req, res) => {
  try {
    const response = await axios.get(`${RFQ_SERVICE_URL}/health`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to reach RFQ service',
      message: error.message
    });
  }
});

// Add this before the vendor routes
router.get('/vendor-health', async (req, res) => {
  try {
    const response = await axios.get(`${VENDOR_SERVICE_URL}/health`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to reach vendor service',
      message: error.message
    });
  }
});

module.exports = router; 