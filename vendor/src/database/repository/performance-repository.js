const Performance = require('../models/performance');
const { NotFoundError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('performance-repository');

class PerformanceRepository {
    async CreatePerformance(vendorId) {
        try {
            // Check if performance record already exists
            const existingPerformance = await Performance.findOne({ vendorId });
            
            if (existingPerformance) {
                return existingPerformance;
            }
            
            // Create new performance record
            const performance = new Performance({
                vendorId,
                metrics: {
                    fulfillmentRate: 0,
                    onTimeDelivery: 0,
                    returnRate: 0,
                    cancellationRate: 0,
                    responseTime: 0,
                    disputeRate: 0
                },
                monthlyPerformance: []
            });
            
            const result = await performance.save();
            return result;
        } catch (error) {
            logger.error(`Error creating performance: ${error.message}`);
            throw error;
        }
    }

    async FindPerformance(id) {
        try {
            const performance = await Performance.findById(id);
            
            if (!performance) {
                throw new NotFoundError(`Performance with ID ${id} not found`);
            }
            
            return performance;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error finding performance: ${error.message}`);
            throw error;
        }
    }

    async FindPerformanceByVendor(vendorId) {
        try {
            const performance = await Performance.findOne({ vendorId });
            
            if (!performance) {
                throw new NotFoundError(`Performance for vendor ID ${vendorId} not found`);
            }
            
            return performance;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error finding performance by vendor: ${error.message}`);
            throw error;
        }
    }

    async UpdatePerformanceMetrics(vendorId, metrics) {
        try {
            let performance = await Performance.findOne({ vendorId });
            
            if (!performance) {
                // Create new performance record if it doesn't exist
                performance = await this.CreatePerformance(vendorId);
            }
            
            // Update metrics
            Object.keys(metrics).forEach(key => {
                if (performance.metrics.hasOwnProperty(key)) {
                    performance.metrics[key] = metrics[key];
                }
            });
            
            performance.lastUpdated = Date.now();
            
            const updatedPerformance = await performance.save();
            return updatedPerformance;
        } catch (error) {
            logger.error(`Error updating performance metrics: ${error.message}`);
            throw error;
        }
    }

    async AddMonthlyPerformance(vendorId, monthData) {
        try {
            let performance = await Performance.findOne({ vendorId });
            
            if (!performance) {
                // Create new performance record if it doesn't exist
                performance = await this.CreatePerformance(vendorId);
            }
            
            // Check if month already exists
            const monthExists = performance.monthlyPerformance.find(
                mp => mp.month.getMonth() === monthData.month.getMonth() && 
                     mp.month.getFullYear() === monthData.month.getFullYear()
            );
            
            if (monthExists) {
                // Update existing month
                Object.keys(monthData).forEach(key => {
                    if (key !== 'month') {
                        monthExists[key] = monthData[key];
                    }
                });
            } else {
                // Add new month
                performance.monthlyPerformance.push(monthData);
            }
            
            performance.lastUpdated = Date.now();
            
            const updatedPerformance = await performance.save();
            return updatedPerformance;
        } catch (error) {
            logger.error(`Error adding monthly performance: ${error.message}`);
            throw error;
        }
    }

    async CalculatePerformanceMetrics(vendorId) {
        try {
            let performance = await Performance.findOne({ vendorId });
            
            if (!performance) {
                // Create new performance record if it doesn't exist
                performance = await this.CreatePerformance(vendorId);
                return performance;
            }
            
            // In a real application, this would calculate metrics based on order data
            // For now, we'll just return the existing performance
            
            return performance;
        } catch (error) {
            logger.error(`Error calculating performance metrics: ${error.message}`);
            throw error;
        }
    }
}

module.exports = PerformanceRepository; 