const express = require('express');
const SearchService = require('../services/search-service');
const AnalyticsService = require('../services/analytics-service');
const { validateQuery, validateBody, validateParams } = require('./middlewares/validator');
const { searchSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('search-api');

module.exports = (app, channel) => {
    const router = express.Router();
    const searchService = new SearchService();
    const analyticsService = new AnalyticsService();

    // Search products
    router.get('/', validateQuery(searchSchema.query), async (req, res, next) => {
        try {
            const { q, page = 1, limit = 10, ...filters } = req.query;
            const sort = {};
            
            // Extract sort parameters
            if (req.query.sortBy) {
                sort.field = req.query.sortBy;
                sort.order = req.query.sortOrder || 'asc';
            }
            
            // Get user ID if authenticated
            const userId = req.user ? req.user.id : null;
            
            // Perform search
            const results = await searchService.SearchProducts(
                q, 
                filters, 
                { page: parseInt(page), limit: parseInt(limit) },
                sort,
                userId
            );
            
            // Track search for analytics if query exists
            if (q && q.trim()) {
                await analyticsService.TrackSearch({
                    userId,
                    searchQuery: q,
                    filters,
                    resultCount: results.total,
                    sessionId: req.headers['x-session-id'] || 'unknown',
                    timestamp: new Date()
                });
            }
            
            res.status(200).json(results);
        } catch (err) {
            next(err);
        }
    });

    // Get search suggestions
    router.get('/suggest', validateQuery(searchSchema.suggest), async (req, res, next) => {
        try {
            const { q, limit = 5 } = req.query;
            
            if (!q || q.trim() === '') {
                return res.status(200).json({ suggestions: [] });
            }
            
            const suggestions = await searchService.GetSuggestions(q, parseInt(limit));
            res.status(200).json({ suggestions });
        } catch (err) {
            next(err);
        }
    });

    // Index a product
    router.post('/index', validateBody(searchSchema.index), async (req, res, next) => {
        try {
            const result = await searchService.IndexProduct(req.body);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    });

    // Delete a product from index
    router.delete('/index/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await searchService.DeleteProduct(id);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    });

    // Get search analytics
    router.get('/analytics', async (req, res, next) => {
        try {
            const { startDate, endDate } = req.query;
            const analytics = await analyticsService.GetSearchAnalytics(startDate, endDate);
            res.status(200).json(analytics);
        } catch (err) {
            next(err);
        }
    });

    // Track product click
    router.post('/track/click', validateBody(searchSchema.analytics), async (req, res, next) => {
        try {
            await analyticsService.TrackProductClick(req.body);
            res.status(200).json({ success: true });
        } catch (err) {
            next(err);
        }
    });

    return router;
}; 