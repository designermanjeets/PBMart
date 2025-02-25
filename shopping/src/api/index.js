module.exports = {
    shopping: require('./shopping'),
    appEvents: require('./app-events'),
}

// Add a root route handler
module.exports.setupRootRoutes = (app) => {
    app.get('/api/shopping', (req, res) => {
        res.json({
            service: 'Shopping Service',
            version: '1.0.0',
            endpoints: [
                '/api/shopping/cart',
                '/api/shopping/cart/:id',
                '/api/shopping/wishlist',
                '/api/shopping/wishlist/:id',
                '/api/shopping/orders',
                '/api/shopping/orders/:id',
                '/api/shopping/checkout',
                '/api/shopping/health'
            ]
        });
    });
};
