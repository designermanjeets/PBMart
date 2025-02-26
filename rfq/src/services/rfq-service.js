const RfqRepository = require('../database/repository/rfq-repository');
const QuoteRepository = require('../database/repository/quote-repository');
const { publishMessage } = require('../utils/message-broker');
const { createLogger } = require('../utils/logger');
const { NotFoundError, ValidationError, AuthorizationError } = require('../utils/errors');
const { RFQ_EXPIRY_DAYS } = require('../config');

const logger = createLogger('rfq-service');

class RfqService {
    constructor(channel) {
        this.channel = channel;
        this.rfqRepository = new RfqRepository();
        this.quoteRepository = new QuoteRepository();
    }
    
    async CreateRfq(rfqData) {
        try {
            // Set expiry date if not provided
            if (!rfqData.expiryDate) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + parseInt(RFQ_EXPIRY_DAYS));
                rfqData.expiryDate = expiryDate;
            }
            
            const rfq = await this.rfqRepository.CreateRfq(rfqData);
            
            // Publish event if channel is available
            if (this.channel) {
                await publishMessage(this.channel, 'rfq.created', {
                    id: rfq.id,
                    buyerId: rfq.buyerId,
                    title: rfq.title,
                    status: rfq.status,
                    invitedVendors: rfq.invitedVendors
                });
            }
            
            return rfq;
        } catch (error) {
            logger.error(`Error creating RFQ: ${error.message}`);
            throw error;
        }
    }
    
    async GetRfqById(id) {
        try {
            return await this.rfqRepository.FindRfqById(id);
        } catch (error) {
            logger.error(`Error getting RFQ by ID: ${error.message}`);
            throw error;
        }
    }
    
    async GetRfqs(query) {
        try {
            return await this.rfqRepository.FindRfqs(query);
        } catch (error) {
            logger.error(`Error getting RFQs: ${error.message}`);
            throw error;
        }
    }
    
    async UpdateRfq(id, updateData, userId) {
        try {
            // Get existing RFQ
            const existingRfq = await this.rfqRepository.FindRfqById(id);
            
            // Check if user is authorized to update
            if (existingRfq.createdBy !== userId && !updateData.isAdmin) {
                throw new AuthorizationError('You are not authorized to update this RFQ');
            }
            
            // Remove isAdmin flag from update data
            if (updateData.isAdmin) {
                delete updateData.isAdmin;
            }
            
            const rfq = await this.rfqRepository.UpdateRfq(id, updateData);
            
            // Publish event if channel is available and status changed
            if (this.channel && updateData.status && updateData.status !== existingRfq.status) {
                await publishMessage(this.channel, 'rfq.updated', {
                    id: rfq.id,
                    buyerId: rfq.buyerId,
                    title: rfq.title,
                    status: rfq.status,
                    invitedVendors: rfq.invitedVendors
                });
            }
            
            return rfq;
        } catch (error) {
            logger.error(`Error updating RFQ: ${error.message}`);
            throw error;
        }
    }
    
    async DeleteRfq(id, userId) {
        try {
            // Get existing RFQ
            const existingRfq = await this.rfqRepository.FindRfqById(id);
            
            // Check if user is authorized to delete
            if (existingRfq.createdBy !== userId && !isAdmin) {
                throw new AuthorizationError('You are not authorized to delete this RFQ');
            }
            
            return await this.rfqRepository.DeleteRfq(id);
        } catch (error) {
            logger.error(`Error deleting RFQ: ${error.message}`);
            throw error;
        }
    }
    
    async InviteVendors(id, vendors, userId) {
        try {
            // Get existing RFQ
            const existingRfq = await this.rfqRepository.FindRfqById(id);
            
            // Check if user is authorized to invite vendors
            if (existingRfq.createdBy !== userId && !isAdmin) {
                throw new AuthorizationError('You are not authorized to invite vendors to this RFQ');
            }
            
            // Check if RFQ is in a valid state for inviting vendors
            if (existingRfq.status !== 'draft' && existingRfq.status !== 'published') {
                throw new ValidationError('Cannot invite vendors to a closed, expired, or cancelled RFQ');
            }
            
            // Add vendors to RFQ
            for (const vendor of vendors) {
                await this.rfqRepository.AddVendorToRfq(id, vendor);
            }
            
            // Get updated RFQ
            const updatedRfq = await this.rfqRepository.FindRfqById(id);
            
            // Publish event if channel is available
            if (this.channel) {
                await publishMessage(this.channel, 'rfq.vendors.invited', {
                    id: updatedRfq.id,
                    buyerId: updatedRfq.buyerId,
                    title: updatedRfq.title,
                    invitedVendors: updatedRfq.invitedVendors
                });
            }
            
            return updatedRfq;
        } catch (error) {
            logger.error(`Error inviting vendors to RFQ: ${error.message}`);
            throw error;
        }
    }
    
    async UpdateVendorStatus(id, vendorId, status, userId) {
        try {
            // Check if status is valid
            if (!['pending', 'accepted', 'declined'].includes(status)) {
                throw new ValidationError('Invalid status. Must be pending, accepted, or declined');
            }
            
            return await this.rfqRepository.UpdateVendorStatus(id, vendorId, status);
        } catch (error) {
            logger.error(`Error updating vendor status: ${error.message}`);
            throw error;
        }
    }
    
    async GetQuotesForRfq(rfqId) {
        try {
            return await this.quoteRepository.FindQuotesByRfqId(rfqId);
        } catch (error) {
            logger.error(`Error getting quotes for RFQ: ${error.message}`);
            throw error;
        }
    }
    
    // Event handlers
    async SubscribeEvents(event, data) {
        logger.info(`Received event ${event} with data:`, data);
        
        switch (event) {
            case 'quote.submitted':
                await this.HandleQuoteSubmitted(data);
                break;
            case 'quote.accepted':
                await this.HandleQuoteAccepted(data);
                break;
            default:
                break;
        }
    }
    
    async HandleQuoteSubmitted(data) {
        try {
            const { rfqId, vendorId } = data;
            
            // Update vendor status to accepted if it was pending
            const rfq = await this.rfqRepository.FindRfqById(rfqId);
            
            const vendorIndex = rfq.invitedVendors.findIndex(
                vendor => vendor.vendorId === vendorId
            );
            
            if (vendorIndex !== -1 && rfq.invitedVendors[vendorIndex].status === 'pending') {
                await this.rfqRepository.UpdateVendorStatus(rfqId, vendorId, 'accepted');
            }
        } catch (error) {
            logger.error(`Error handling quote submitted event: ${error.message}`);
        }
    }
    
    async HandleQuoteAccepted(data) {
        try {
            const { rfqId } = data;
            
            // Update RFQ status to closed
            await this.rfqRepository.UpdateRfq(rfqId, { status: 'closed' });
        } catch (error) {
            logger.error(`Error handling quote accepted event: ${error.message}`);
        }
    }
}

module.exports = RfqService; 