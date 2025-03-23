const SearchService = require('../../services/search-service');
const { subscribeMessage } = require('../../utils/message-broker');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('search-controller');

class SearchController {
    constructor(channel) {
        this.service = new SearchService();
        
        // Subscribe to product events if channel is available
        if (channel) {
            subscribeMessage(channel, this.service);
            logger.info('Subscribed to product events');
        }
    }
    
    Search = async (req, res, next) => {
        try {
            const { q, page = 1, limit = 10, sortBy, sortOrder = 'asc', ...filters } = req.query;
            
            // Get user ID from token if available
            const userId = req.user ? req.user.id : null;
            
            // Build pagination and sort objects
            const pagination = { page: parseInt(page), limit: parseInt(limit) };
            const sort = sortBy ? { [sortBy]: sortOrder } : {};
            
            // Execute search
            const result = await this.service.SearchProducts(q, filters, pagination, sort, userId);
            
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Search error: ${error.message}`);
            
            // Return a friendly error response
            return res.status(500).json({
                status: 'error',
                message: error.message,
                fallback: true
            });
        }
    };
    
    GetSuggestions = async (req, res, next) => {
        try {
            const { q, limit = 5 } = req.query;
            
            if (!q || q.trim() === '') {
                return res.status(200).json({ suggestions: [] });
            }
            
            const suggestions = await this.service.GetSuggestions(q, parseInt(limit));
            
            return res.status(200).json({ suggestions });
        } catch (error) {
            next(error);
        }
    };
    
    GetFilterValues = async (req, res, next) => {
        try {
            const { field } = req.params;
            const tenantId = req.query.tenantId;
            
            const values = await this.service.GetFilterValues(field, tenantId);
            
            return res.status(200).json({ field, values });
        } catch (error) {
            next(error);
        }
    };
    
    IndexProduct = async (req, res, next) => {
        try {
            const product = req.body;
            
            const result = await this.service.IndexProduct(product);
            
            return res.status(200).json({
                message: 'Product indexed successfully',
                result
            });
        } catch (error) {
            next(error);
        }
    };
    
    DeleteProduct = async (req, res, next) => {
        try {
            const { id } = req.params;
            
            const result = await this.service.DeleteProduct(id);
            
            return res.status(200).json({
                message: 'Product deleted from index',
                result
            });
        } catch (error) {
            next(error);
        }
    };
    
    BulkIndexProducts = async (req, res, next) => {
        try {
            const products = req.body;
            
            if (!Array.isArray(products)) {
                return res.status(400).json({
                    error: 'Invalid request',
                    message: 'Request body must be an array of products'
                });
            }
            
            const result = await this.service.BulkIndexProducts(products);
            
            return res.status(200).json({
                message: 'Products indexed successfully',
                result
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = SearchController; 