module.exports = {
    customers: require('./customers'),
    appEvents: require('./app-events')
};

// Add a root route handler
module.exports.setupRootRoutes = (app) => {
    app.get('/api/customers', (req, res) => {
        res.json({
            service: 'Customers Service',
            version: '1.0.0',
            endpoints: [
                '/api/customers/signup',
                '/api/customers/login',
                '/api/customers/profile',
                '/api/customers/wishlist',
                '/api/customers/cart',
                '/api/customers/orders',
                '/api/customers/health'
            ]
        });
    });
};
