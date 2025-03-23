const express = require('express');
const cors = require('cors');
const path = require('path');
const { search, setupRootRoutes } = require('./api');
const errorHandler = require('./api/middlewares/error-handler');
const { createChannel } = require('./utils/message-broker');
const { createLogger } = require('./utils/logger');
const logger = createLogger('express-app');

module.exports = async (app) => {
    try {
        // Create message broker channel
        let channel;
        try {
            channel = await createChannel();
        } catch (error) {
            logger.warn(`Failed to create message broker channel: ${error.message}`);
        }
        
        // Middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());
        
        // Simple search endpoint that works without Elasticsearch
        app.get('/api/search', async (req, res) => {
            try {
                const { q = '' } = req.query;
                
                // Return mock data
                const mockProducts = [
                    {
                        id: 'mock-product-1',
                        name: 'Mock Product 1',
                        description: 'This is a mock product for testing',
                        price: 99.99,
                        category: 'Electronics',
                        brand: 'MockBrand',
                        inStock: true
                    },
                    {
                        id: 'mock-product-2',
                        name: 'Mock Product 2',
                        description: 'Another mock product for testing',
                        price: 149.99,
                        category: 'Home & Kitchen',
                        brand: 'HomeMock',
                        inStock: true
                    }
                ];
                
                // Filter by query if provided
                const filteredProducts = q 
                    ? mockProducts.filter(p => 
                        p.name.toLowerCase().includes(q.toLowerCase()) || 
                        p.description.toLowerCase().includes(q.toLowerCase()))
                    : mockProducts;
                
                res.status(200).json({
                    hits: filteredProducts,
                    total: filteredProducts.length,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    query: q,
                    fallback: true,
                    message: 'Using mock data because Elasticsearch is not available'
                });
            } catch (error) {
                logger.error(`Search error: ${error.message}`);
                res.status(500).json({
                    status: 'error',
                    message: 'Failed to search products',
                    fallback: true
                });
            }
        });
        
        // Health check endpoint
        app.get('/api/search/health', (req, res) => {
            res.status(200).json({
                service: 'Search Service',
                status: 'ok',
                message: 'Service is running in fallback mode',
                timestamp: new Date()
            });
        });
        
        // API routes
        setupRootRoutes(app);
        app.use('/api/search', search(app, channel));
        
        // Static files (if needed)
        const staticDir = path.join(__dirname, 'public');
        app.use(express.static(staticDir));
        
        // Error handling for 404
        app.use('*', (req, res) => {
            res.status(404).json({
                status: 'error',
                message: `Route ${req.originalUrl} not found`
            });
        });
        
        // Error handling
        app.use(errorHandler);
        
        logger.info('Express app configured');
    } catch (error) {
        logger.error(`Error configuring express app: ${error.message}`);
        throw error;
    }
}; 