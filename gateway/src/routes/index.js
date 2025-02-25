const express = require('express');
const router = express.Router();
const productsRoutes = require('./products');
const customersRoutes = require('./customers');
const shoppingRoutes = require('./shopping');
const tenantRoutes = require('./tenant');

// Root path handler
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the B2B eCommerce API Gateway',
    version: '1.0.0',
    services: [
      { name: 'Products', endpoint: '/api/products' },
      { name: 'Customers', endpoint: '/api/customers' },
      { name: 'Shopping', endpoint: '/api/shopping' },
      { name: 'Tenants', endpoint: '/api/tenants' }
    ],
    documentation: '/api/docs'
  });
});

// Health check for the gateway itself
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'API Gateway',
    status: 'active',
    time: new Date().toISOString()
  });
});

// Mount service routes
router.use('/products', productsRoutes);
router.use('/customers', customersRoutes);
router.use('/shopping', shoppingRoutes);
router.use('/tenants', tenantRoutes);

module.exports = router; 