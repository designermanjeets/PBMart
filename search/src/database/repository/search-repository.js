const mongoose = require('mongoose');
const SearchAnalytics = require('../models/search-analytics');
const ClickAnalytics = require('../models/click-analytics');
const { DB_URL } = require('../../config');
const { DatabaseError, NotFoundError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('search-repository');

class SearchRepository {
    async SaveSearchQuery(data) {
        try {
            if (!DB_URL) {
                logger.info('No database URL provided, skipping search query save');
                return null;
            }
            
            const analytics = new SearchAnalytics(data);
            return await analytics.save();
        } catch (error) {
            logger.error(`Error saving search query: ${error.message}`);
            return null;
        }
    }
    
    async SaveProductClick(data) {
        try {
            if (!DB_URL) {
                logger.info('No database URL provided, skipping product click save');
                return null;
            }
            
            const analytics = new ClickAnalytics(data);
            return await analytics.save();
        } catch (error) {
            logger.error(`Error saving product click: ${error.message}`);
            return null;
        }
    }
    
    async GetSearchAnalytics(startDate, endDate) {
        try {
            if (!DB_URL) {
                logger.info('No database URL provided, skipping search analytics retrieval');
                return {
                    topSearches: [],
                    searchVolume: [],
                    clickThroughRate: 0,
                    zeroResultsRate: 0
                };
            }
            
            const query = {};
            
            if (startDate || endDate) {
                query.timestamp = {};
                
                if (startDate) {
                    query.timestamp.$gte = new Date(startDate);
                }
                
                if (endDate) {
                    query.timestamp.$lte = new Date(endDate);
                }
            }
            
            // Get top searches
            const topSearches = await SearchAnalytics.aggregate([
                { $match: query },
                { $group: { _id: '$searchQuery', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);
            
            // Get search volume over time
            const searchVolume = await SearchAnalytics.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            
            // Get zero results rate
            const totalSearches = await SearchAnalytics.countDocuments(query);
            const zeroResults = await SearchAnalytics.countDocuments({
                ...query,
                resultCount: 0
            });
            
            // Get click-through rate
            const totalClicks = await ClickAnalytics.countDocuments(query);
            
            return {
                topSearches: topSearches.map(item => ({
                    query: item._id,
                    count: item.count
                })),
                searchVolume: searchVolume.map(item => ({
                    date: item._id,
                    count: item.count
                })),
                clickThroughRate: totalSearches > 0 ? totalClicks / totalSearches : 0,
                zeroResultsRate: totalSearches > 0 ? zeroResults / totalSearches : 0
            };
        } catch (error) {
            logger.error(`Error getting search analytics: ${error.message}`);
            throw error;
        }
    }

    async GetPopularSearches(limit = 10) {
        try {
            const result = await SearchAnalytics.aggregate([
                {
                    $group: {
                        _id: '$searchQuery',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: limit
                }
            ]);
            
            return result.map(item => ({
                query: item._id,
                count: item.count
            }));
        } catch (error) {
            logger.error(`Error getting popular searches: ${error.message}`);
            throw new DatabaseError(`Failed to get popular searches: ${error.message}`);
        }
    }

    async TrackProductClick(data) {
        try {
            const { sessionId, searchQuery, productId } = data;
            
            // Find the search analytics record for this session and query
            const analytics = await SearchAnalytics.findOne({
                sessionId,
                searchQuery
            }).sort({ timestamp: -1 });
            
            if (!analytics) {
                logger.warn(`No search analytics found for session ${sessionId} and query "${searchQuery}"`);
                return null;
            }
            
            // Add the clicked product if not already in the list
            if (!analytics.clickedResults.includes(productId)) {
                analytics.clickedResults.push(productId);
                await analytics.save();
            }
            
            return analytics;
        } catch (error) {
            logger.error(`Error tracking product click: ${error.message}`);
            throw new DatabaseError(`Failed to track product click: ${error.message}`);
        }
    }
}

// Static method to check connection
SearchRepository.checkConnection = async () => {
    try {
        if (!DB_URL) {
            return false;
        }
        
        const mongoose = require('mongoose');
        return mongoose.connection.readyState === 1; // 1 = connected
    } catch (error) {
        logger.error(`Error checking database connection: ${error.message}`);
        return false;
    }
};

module.exports = SearchRepository; 