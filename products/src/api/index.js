const products = require('./products');
const appEvents = require('./app-events');

module.exports = {
    products: require('./products'),
    appEvents
};

// Add a root route handler for API documentation
module.exports.setupRootRoutes = (app) => {
    app.get('/api/products/docs', (req, res) => {
        res.json({
            service: 'Products Service',
            version: '1.0.0',
            endpoints: [
                '/api/products',                  // Get all products
                '/api/products/create',           // Create a product
                '/api/products/category/:type',   // Get products by category
                '/api/products/:id',              // Get product by ID
                '/api/products/ids',              // Get products by IDs
                '/api/products/wishlist',         // Add product to wishlist
                '/api/products/wishlist/:id',     // Remove product from wishlist
                '/api/products/cart',             // Add product to cart
                '/api/products/cart/:id',         // Remove product from cart
                '/api/products/test-db'           // Test database connection
            ]
        });
    });
};
