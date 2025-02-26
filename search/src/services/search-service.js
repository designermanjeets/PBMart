const ElasticsearchService = require('./elasticsearch-service');
const SearchRepository = require('../database/repository/search-repository');
const { ElasticsearchError, ValidationError, NotFoundError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('search-service');

class SearchService {
    constructor() {
        this.elasticsearchService = new ElasticsearchService();
        this.searchRepository = new SearchRepository();
    }
    
    async SearchProducts(query, filters = {}, pagination = { page: 1, limit: 10 }, sort = {}, userId = null) {
        try {
            // Ensure Elasticsearch is connected
            if (!this.elasticsearchService.isConnected) {
                await this.elasticsearchService.initializeConnection();
            }
            
            // Build search query
            const searchQuery = query ? query.trim() : '';
            
            // Execute search
            const results = await this.elasticsearchService.SearchProducts(
                searchQuery, 
                filters, 
                pagination, 
                sort
            );
            
            // Save search query for analytics
            if (query) {
                await this.searchRepository.SaveSearchQuery({
                    query,
                    filters,
                    userId,
                    tenantId: filters.tenantId,
                    resultCount: results.pagination.total
                });
                
                // Index search analytics in Elasticsearch
                await this.elasticsearchService.indexSearchAnalytics({
                    query,
                    filters,
                    userId,
                    tenantId: filters.tenantId,
                    resultCount: results.pagination.total,
                    timestamp: new Date()
                });
            }
            
            return results;
        } catch (error) {
            logger.error(`Error searching products: ${error.message}`);
            throw error;
        }
    }
    
    async GetProductSuggestions(prefix, tenantId = null) {
        try {
            if (!prefix || prefix.trim() === '') {
                return [];
            }
            
            return await this.elasticsearchService.getProductSuggestions(prefix, tenantId);
        } catch (error) {
            logger.error(`Error getting product suggestions: ${error.message}`);
            if (error instanceof ElasticsearchError) {
                throw error;
            }
            throw new Error(`Error getting product suggestions: ${error.message}`);
        }
    }
    
    async GetFilterValues(field, tenantId = null) {
        try {
            const validFields = ['category', 'brand', 'tags'];
            
            if (!validFields.includes(field)) {
                throw new ValidationError(`Invalid field for filter values: ${field}`);
            }
            
            return await this.elasticsearchService.getFilterValues(field, tenantId);
        } catch (error) {
            logger.error(`Error getting filter values: ${error.message}`);
            if (error instanceof ElasticsearchError || error instanceof ValidationError) {
                throw error;
            }
            throw new Error(`Error getting filter values: ${error.message}`);
        }
    }
    
    async GetRecentSearches(userId, limit = 10) {
        try {
            if (!userId) {
                throw new ValidationError('User ID is required');
            }
            
            return await this.searchRepository.GetRecentSearches(userId, limit);
        } catch (error) {
            logger.error(`Error getting recent searches: ${error.message}`);
            throw error;
        }
    }
    
    async GetPopularSearches(tenantId = null, limit = 10) {
        try {
            return await this.searchRepository.GetPopularSearches(tenantId, limit);
        } catch (error) {
            logger.error(`Error getting popular searches: ${error.message}`);
            throw error;
        }
    }
    
    async IndexProduct(product) {
        try {
            // Ensure Elasticsearch is connected
            if (!this.elasticsearchService.isConnected) {
                await this.elasticsearchService.initializeConnection();
            }
            
            // Validate product
            if (!product.id) {
                throw new ValidationError('Product ID is required');
            }
            
            if (!product.name) {
                throw new ValidationError('Product name is required');
            }
            
            // Index product
            const result = await this.elasticsearchService.IndexProduct(product);
            
            return result;
        } catch (error) {
            logger.error(`Error indexing product: ${error.message}`);
            throw error;
        }
    }
    
    async UpdateProduct(productId, updates) {
        try {
            return await this.elasticsearchService.updateProduct(productId, updates);
        } catch (error) {
            logger.error(`Error updating product: ${error.message}`);
            throw error;
        }
    }
    
    async DeleteProduct(productId) {
        try {
            // Ensure Elasticsearch is connected
            if (!this.elasticsearchService.isConnected) {
                await this.elasticsearchService.initializeConnection();
            }
            
            // Delete product
            const result = await this.elasticsearchService.DeleteProduct(productId);
            
            return result;
        } catch (error) {
            logger.error(`Error deleting product: ${error.message}`);
            throw error;
        }
    }
    
    async BulkIndexProducts(products) {
        try {
            return await this.elasticsearchService.bulkIndex(products);
        } catch (error) {
            logger.error(`Error bulk indexing products: ${error.message}`);
            throw error;
        }
    }
    
    // Event handlers for product updates from message broker
    async SubscribeEvents(payload) {
        const { event, data } = payload;
        
        switch(event) {
            case 'PRODUCT_CREATED':
                await this.IndexProduct(data);
                break;
                
            case 'PRODUCT_UPDATED':
                await this.IndexProduct(data);
                break;
                
            case 'PRODUCT_DELETED':
                await this.DeleteProduct(data.id);
                break;
                
            case 'PRODUCTS_BULK_INDEX':
                await this.BulkIndexProducts(data);
                break;
                
            default:
                logger.warn(`Unhandled event: ${event}`);
        }
    }
}

module.exports = SearchService; 