const SearchRepository = require('../database/repository/search-repository');
const ElasticsearchService = require('./elasticsearch-service');
const { ValidationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('analytics-service');

class AnalyticsService {
    constructor() {
        this.repository = new SearchRepository();
        this.elasticsearchService = new ElasticsearchService();
    }

    async TrackSearch(data) {
        try {
            // Save to MongoDB
            const result = await this.repository.SaveSearchQuery(data);
            
            // Save to Elasticsearch
            await this.elasticsearchService.indexSearchAnalytics({
                ...data,
                timestamp: data.timestamp || new Date()
            });
            
            return result || { id: 'es-only' };
        } catch (error) {
            logger.error(`Error tracking search: ${error.message}`);
            throw error;
        }
    }

    async TrackProductClick(data) {
        try {
            // Save to MongoDB
            const result = await this.repository.SaveProductClick(data);
            
            // Save to Elasticsearch
            await this.elasticsearchService.indexProductClick({
                ...data,
                timestamp: data.timestamp || new Date()
            });
            
            return result || { success: true };
        } catch (error) {
            logger.error(`Error tracking product click: ${error.message}`);
            throw error;
        }
    }

    async GetSearchAnalytics(startDate, endDate) {
        try {
            // Try to get analytics from MongoDB first
            try {
                const mongoAnalytics = await this.repository.GetSearchAnalytics(startDate, endDate);
                return mongoAnalytics;
            } catch (mongoError) {
                logger.warn(`Failed to get analytics from MongoDB: ${mongoError.message}`);
                
                // Fall back to Elasticsearch
                const esAnalytics = await this.elasticsearchService.GetSearchAnalytics(startDate, endDate);
                return esAnalytics;
            }
        } catch (error) {
            logger.error(`Error getting search analytics: ${error.message}`);
            throw error;
        }
    }
}

module.exports = AnalyticsService; 