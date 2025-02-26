const VendorRepository = require('../database/repository/vendor-repository');
const VerificationRepository = require('../database/repository/verification-repository');
const PerformanceRepository = require('../database/repository/performance-repository');
const { publishMessage } = require('../utils/message-broker');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('vendor-service');

class VendorService {
    constructor(channel) {
        this.channel = channel;
        this.vendorRepository = new VendorRepository();
        this.verificationRepository = new VerificationRepository();
        this.performanceRepository = new PerformanceRepository();
    }
    
    async RegisterVendor(vendorData) {
        try {
            // Create vendor
            const vendor = await this.vendorRepository.CreateVendor(vendorData);
            
            // Initialize performance metrics
            await this.performanceRepository.CreatePerformance(vendor._id);
            
            // Publish event
            if (this.channel) {
                await publishMessage(this.channel, 'vendor.created', {
                    id: vendor._id,
                    businessName: vendor.businessName,
                    status: vendor.status,
                    verificationStatus: vendor.verificationStatus
                });
            }
            
            return vendor;
        } catch (error) {
            logger.error(`Error registering vendor: ${error.message}`);
            throw error;
        }
    }
    
    async GetVendor(id) {
        try {
            return await this.vendorRepository.FindVendor(id);
        } catch (error) {
            logger.error(`Error getting vendor: ${error.message}`);
            throw error;
        }
    }
    
    async GetVendors(options) {
        try {
            return await this.vendorRepository.FindVendors({}, options);
        } catch (error) {
            logger.error(`Error getting vendors: ${error.message}`);
            throw error;
        }
    }
    
    async UpdateVendor(id, updates) {
        try {
            const vendor = await this.vendorRepository.UpdateVendor(id, updates);
            
            // Publish event
            if (this.channel) {
                await publishMessage(this.channel, 'vendor.updated', {
                    id: vendor._id,
                    businessName: vendor.businessName,
                    status: vendor.status,
                    verificationStatus: vendor.verificationStatus
                });
            }
            
            return vendor;
        } catch (error) {
            logger.error(`Error updating vendor: ${error.message}`);
            throw error;
        }
    }
    
    async UpdateVendorStatus(id, status) {
        try {
            const vendor = await this.vendorRepository.UpdateVendorStatus(id, status);
            
            // Publish event
            if (this.channel) {
                await publishMessage(this.channel, 'vendor.status_changed', {
                    id: vendor._id,
                    businessName: vendor.businessName,
                    status: vendor.status
                });
            }
            
            return vendor;
        } catch (error) {
            logger.error(`Error updating vendor status: ${error.message}`);
            throw error;
        }
    }
    
    async DeleteVendor(id) {
        try {
            return await this.vendorRepository.DeleteVendor(id);
        } catch (error) {
            logger.error(`Error deleting vendor: ${error.message}`);
            throw error;
        }
    }
    
    async GetVendorPerformance(id) {
        try {
            // Get vendor to ensure it exists
            await this.vendorRepository.FindVendor(id);
            
            try {
                return await this.performanceRepository.FindPerformanceByVendor(id);
            } catch (error) {
                if (error instanceof NotFoundError) {
                    // Create performance record if it doesn't exist
                    return await this.performanceRepository.CreatePerformance(id);
                }
                throw error;
            }
        } catch (error) {
            logger.error(`Error getting vendor performance: ${error.message}`);
            throw error;
        }
    }
    
    async CalculateVendorPerformance(id) {
        try {
            // Get vendor to ensure it exists
            await this.vendorRepository.FindVendor(id);
            
            return await this.performanceRepository.CalculatePerformanceMetrics(id);
        } catch (error) {
            logger.error(`Error calculating vendor performance: ${error.message}`);
            throw error;
        }
    }
    
    // Event handling
    async SubscribeEvents(payload) {
        const { event, data } = payload;
        
        switch (event) {
            case 'ORDER_COMPLETED':
                await this.handleOrderCompleted(data);
                break;
            case 'REVIEW_CREATED':
                await this.handleReviewCreated(data);
                break;
            default:
                break;
        }
    }
    
    async handleOrderCompleted(data) {
        try {
            const { vendorId } = data;
            
            if (!vendorId) {
                return;
            }
            
            // Update performance metrics based on order data
            // This is a simplified example
            await this.performanceRepository.UpdatePerformanceMetrics(vendorId, {
                fulfillmentRate: data.fulfillmentRate || 0,
                onTimeDelivery: data.onTimeDelivery || 0
            });
        } catch (error) {
            logger.error(`Error handling order completed event: ${error.message}`);
        }
    }
    
    async handleReviewCreated(data) {
        try {
            const { vendorId, rating } = data;
            
            if (!vendorId || rating === undefined) {
                return;
            }
            
            // Get current vendor
            const vendor = await this.vendorRepository.FindVendor(vendorId);
            
            // Calculate new rating
            const totalReviews = vendor.totalReviews + 1;
            const newRating = ((vendor.rating * vendor.totalReviews) + rating) / totalReviews;
            
            // Update vendor rating
            await this.vendorRepository.UpdateVendorRating(vendorId, newRating, totalReviews);
        } catch (error) {
            logger.error(`Error handling review created event: ${error.message}`);
        }
    }
}

module.exports = VendorService; 