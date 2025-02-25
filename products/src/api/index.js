const products = require('./products');
const appEvents = require('./app-events');

module.exports = {
    products: require('./products'),
    appEvents
};

// Add a root route handler
module.exports.setupRootRoutes = (app) => {
    app.get('/api/products', (req, res) => {
        res.json({
            service: 'Products Service',
            version: '1.0.0',
            endpoints: [
                '/api/products',
                '/api/products/category/:type',
                '/api/products/:id',
                '/api/products/ids',
                '/api/products/wishlist',
                '/api/products/cart',
                '/api/products/health'
            ]
        });
    });
};
