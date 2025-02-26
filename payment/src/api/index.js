const express = require('express');
const { createLogger } = require('../utils/logger');
const logger = createLogger('api-index');

module.exports = {
    payment: require('./payment')
};

// Add a root route handler
module.exports.setupRootRoutes = (app) => {
    app.get('/api/payment', (req, res) => {
        res.json({
            message: 'Payment Service API',
            version: '1.0.0',
            endpoints: [
                '/api/payment/process',
                '/api/payment/status/:id',
                '/api/payment/customer/:customerId',
                '/api/payment/invoice',
                '/api/payment/invoice/:id',
                '/api/payment/reports',
                '/api/payment/reports/:id',
                '/api/payment/health'
            ]
        });
    });
}; 