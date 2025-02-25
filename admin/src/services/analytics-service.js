const { AnalyticsRepository } = require('../database');
const { NotFoundError, ValidationError, DatabaseError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const { FEATURES } = require('../config');

const logger = createLogger('analytics-service');

class AnalyticsService {
    constructor() {
        this.repository = new AnalyticsRepository();
    }
    
    async GetSalesAnalytics(query) {
        try {
            const result = await this.repository.GetSalesAnalytics(query);
            return result;
        } catch (error) {
            logger.error(`Error getting sales analytics: ${error.message}`);
            
            if (error instanceof ValidationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to get sales analytics: ${error.message}`);
        }
    }
    
    async GetUserAnalytics(query) {
        try {
            const result = await this.repository.GetUserAnalytics(query);
            return result;
        } catch (error) {
            logger.error(`Error getting user analytics: ${error.message}`);
            
            if (error instanceof ValidationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to get user analytics: ${error.message}`);
        }
    }
    
    async GetInventoryAnalytics() {
        try {
            const result = await this.repository.GetInventoryAnalytics();
            return result;
        } catch (error) {
            logger.error(`Error getting inventory analytics: ${error.message}`);
            
            if (error instanceof ValidationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to get inventory analytics: ${error.message}`);
        }
    }
    
    async GetDashboardSummary() {
        try {
            // Get summary data for the dashboard
            const salesData = await this.repository.GetSalesAnalytics({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate: new Date()
            });
            
            const userData = await this.repository.GetUserAnalytics({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate: new Date()
            });
            
            const inventoryData = await this.repository.GetInventoryAnalytics();
            
            return {
                sales: salesData.summary,
                users: userData.summary,
                inventory: inventoryData.inventorySummary,
                topSellingProducts: inventoryData.topSellingProducts.slice(0, 5),
                lowStockProducts: inventoryData.lowStockProducts.slice(0, 5)
            };
        } catch (error) {
            logger.error(`Error getting dashboard summary: ${error.message}`);
            
            if (error instanceof ValidationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to get dashboard summary: ${error.message}`);
        }
    }
    
    async GenerateReport(reportType, options = {}) {
        try {
            // Check if advanced reporting is enabled (premium feature)
            if (!FEATURES.ENABLE_ADVANCED_ANALYTICS) {
                throw new ValidationError('Advanced reporting is only available in the premium version');
            }
            
            let reportData;
            
            switch (reportType) {
                case 'sales':
                    reportData = await this.repository.GetSalesAnalytics(options);
                    break;
                case 'users':
                    reportData = await this.repository.GetUserAnalytics(options);
                    break;
                case 'inventory':
                    reportData = await this.repository.GetInventoryAnalytics();
                    break;
                default:
                    throw new ValidationError(`Invalid report type: ${reportType}`);
            }
            
            // In a real implementation, this would generate a PDF or CSV report
            // For now, we'll just return the data
            return {
                reportType,
                generatedAt: new Date(),
                data: reportData
            };
        } catch (error) {
            logger.error(`Error generating report: ${error.message}`);
            
            if (error instanceof ValidationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to generate report: ${error.message}`);
        }
    }
}

module.exports = AnalyticsService; 