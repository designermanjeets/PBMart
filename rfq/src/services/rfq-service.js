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
    
    async CreateRfq(data) {
        logger.info(`Creating RFQ: ${JSON.stringify(data)}`);
        // This is a placeholder - you would normally save to a database
        return {
            id: `rfq-${Date.now()}`,
            ...data,
            createdAt: new Date()
        };
    }
    
    async GetRfqById(id) {
        logger.info(`Getting RFQ by ID: ${id}`);
        // This is a placeholder - you would normally fetch from a database
        return {
            id,
            title: 'Sample RFQ',
            description: 'This is a sample RFQ',
            createdAt: new Date()
        };
    }
    
    async GetRfqs(query) {
        logger.info(`Getting RFQs with query: ${JSON.stringify(query)}`);
        // This is a placeholder - you would normally fetch from a database
        return [];
    }
    
    async UpdateRfq(id, data, userId) {
        logger.info(`Updating RFQ ${id} with data: ${JSON.stringify(data)}`);
        // This is a placeholder - you would normally update in a database
        return {
            id,
            ...data,
            updatedAt: new Date()
        };
    }
    
    async DeleteRfq(id, userId, isAdmin) {
        logger.info(`Deleting RFQ ${id}`);
        // This is a placeholder - you would normally delete from a database
        return { success: true };
    }
    
    async InviteVendors(id, vendors, userId, isAdmin) {
        logger.info(`Inviting vendors to RFQ ${id}: ${JSON.stringify(vendors)}`);
        // This is a placeholder - you would normally update in a database
        return { success: true, invitedVendors: vendors };
    }
    
    async UpdateVendorStatus(id, vendorId, status, userId) {
        logger.info(`Updating vendor ${vendorId} status to ${status} for RFQ ${id}`);
        // This is a placeholder - you would normally update in a database
        return { success: true };
    }
    
    async GetQuotesForRfq(id) {
        logger.info(`Getting quotes for RFQ ${id}`);
        // This is a placeholder - you would normally fetch from a database
        return [];
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