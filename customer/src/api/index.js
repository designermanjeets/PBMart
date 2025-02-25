module.exports = {
    customer: require('./customer'),
    appEvents: require('./app-events')
};

// Add a root route handler
module.exports.setupRootRoutes = (app) => {
    app.get('/api/customer', (req, res) => {
        res.json({
            service: 'Customer Service',
            version: '1.0.0',
            endpoints: [
                '/api/customer/signup',
                '/api/customer/login',
                '/api/customer/profile',
                '/api/customer/wishlist',
                '/api/customer/cart',
                '/api/customer/address',
                '/api/customer/payment-methods',
                '/api/customer/orders',
                '/api/customer/health'
            ]
        });
    });
};
