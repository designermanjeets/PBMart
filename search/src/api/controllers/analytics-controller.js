const AnalyticsService = require('../../services/analytics-service');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('analytics-controller');

class AnalyticsController {
    constructor() {
        this.service = new AnalyticsService();
    }
    
    GetSearchAnalytics = async (req, res, next) => {
        try {
            const { startDate, endDate } = req.query;
            
            const analytics = await this.service.GetSearchAnalytics(startDate, endDate);
            
            return res.status(200).json(analytics);
        } catch (error) {
            next(error);
        }
    };
    
    TrackSearch = async (req, res, next) => {
        try {
            const data = req.body;
            
            // Add user ID from token if available
            if (req.user) {
                data.userId = req.user.id;
            }
            
            // Add timestamp if not provided
            if (!data.timestamp) {
                data.timestamp = new Date();
            }
            
            const result = await this.service.TrackSearch(data);
            
            return res.status(200).json({
                message: 'Search tracked successfully',
                id: result.id
            });
        } catch (error) {
            next(error);
        }
    };
    
    TrackProductClick = async (req, res, next) => {
        try {
            const data = req.body;
            
            // Add user ID from token if available
            if (req.user) {
                data.userId = req.user.id;
            }
            
            const result = await this.service.TrackProductClick(data);
            
            return res.status(200).json({
                message: 'Product click tracked successfully',
                success: true
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = AnalyticsController; 