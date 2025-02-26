const express = require('express');
const { validateToken } = require('./middlewares/auth');
const { validateSchema } = require('./middlewares/validator');
const { searchSchema } = require('./middlewares/schemas');
const SearchController = require('./controllers/search-controller');
const AnalyticsController = require('./controllers/analytics-controller');
const { createLogger } = require('../utils/logger');
const logger = createLogger('api');

// Create router
const search = (app, channel) => {
    const router = express.Router();
    const searchController = new SearchController(channel);
    const analyticsController = new AnalyticsController();
    
    // Search routes
    router.get('/', validateSchema(searchSchema.query, 'query'), searchController.Search);
    router.get('/suggest', validateSchema(searchSchema.suggest, 'query'), searchController.GetSuggestions);
    router.get('/filters/:field', searchController.GetFilterValues);
    
    // Product indexing routes (protected)
    router.post('/index', validateToken, validateSchema(searchSchema.index, 'body'), searchController.IndexProduct);
    router.delete('/index/:id', validateToken, searchController.DeleteProduct);
    router.post('/index/bulk', validateToken, searchController.BulkIndexProducts);
    
    // Analytics routes
    router.get('/analytics', validateToken, analyticsController.GetSearchAnalytics);
    router.post('/track/search', validateSchema(searchSchema.analytics, 'body'), analyticsController.TrackSearch);
    router.post('/track/click', validateSchema(searchSchema.analytics, 'body'), analyticsController.TrackProductClick);
    
    // Health check
    router.get('/health', async (req, res) => {
        try {
            // Check Elasticsearch connection
            const esStatus = await require('../services/elasticsearch-service').checkConnection();
            
            // Check MongoDB connection
            const dbStatus = await require('../database/repository/search-repository').checkConnection();
            
            const status = {
                service: 'Search Service',
                uptime: process.uptime(),
                timestamp: new Date(),
                elasticsearch: esStatus ? 'connected' : 'disconnected',
                database: dbStatus ? 'connected' : 'disconnected'
            };
            
            // If Elasticsearch is connected, consider the service healthy
            // even if MongoDB is not connected (since MongoDB is optional for search)
            const statusCode = esStatus ? 200 : 503;
            
            res.status(statusCode).json(status);
        } catch (error) {
            logger.error(`Health check failed: ${error.message}`);
            res.status(500).json({
                service: 'Search Service',
                status: 'error',
                message: error.message
            });
        }
    });
    
    return router;
};

// Root routes setup
const setupRootRoutes = (app) => {
    app.get('/', (req, res) => {
        res.status(200).json({
            service: 'Search Service',
            version: '1.0.0',
            endpoints: [
                { method: 'GET', path: '/api/search', description: 'Search products' },
                { method: 'GET', path: '/api/search/suggest', description: 'Get search suggestions' },
                { method: 'GET', path: '/api/search/filters/:field', description: 'Get filter values' },
                { method: 'POST', path: '/api/search/index', description: 'Index a product' },
                { method: 'DELETE', path: '/api/search/index/:id', description: 'Delete a product from index' },
                { method: 'POST', path: '/api/search/index/bulk', description: 'Bulk index products' },
                { method: 'GET', path: '/api/search/analytics', description: 'Get search analytics' },
                { method: 'POST', path: '/api/search/track/search', description: 'Track search query' },
                { method: 'POST', path: '/api/search/track/click', description: 'Track product click' }
            ]
        });
    });
};

module.exports = { search, setupRootRoutes }; 