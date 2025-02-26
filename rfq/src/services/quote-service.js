const QuoteRepository = require('../database/repository/quote-repository');
const RfqRepository = require('../database/repository/rfq-repository');
const { publishMessage } = require('../utils/message-broker');
const { createLogger } = require('../utils/logger');
const { NotFoundError, ValidationError, AuthorizationError, ConflictError } = require('../utils/errors');
const { QUOTE_EXPIRY_DAYS } = require('../config');

const logger = createLogger('quote-service');

class QuoteService {
    constructor(channel) {
        this.channel = channel;
        this.quoteRepository = new QuoteRepository();
        this.rfqRepository = new RfqRepository();
    }
    
    async CreateQuote(quoteData) {
        try {
            // Check if RFQ exists and is open for quotes
            const rfq = await this.rfqRepository.FindRfqById(quoteData.rfqId);
            
            if (rfq.status !== 'published') {
                throw new ValidationError('RFQ is not open for quotes');
            }
            
            // Check if vendor is invited to the RFQ
            const isVendorInvited = rfq.invitedVendors.some(
                vendor => vendor.vendorId === quoteData.vendorId
            );
            
            if (!isVendorInvited) {
                throw new AuthorizationError('Vendor is not invited to this RFQ');
            }
            
            // Check if vendor already submitted a quote
            const existingQuote = await this.quoteRepository.FindQuoteByRfqAndVendor(
                quoteData.rfqId,
                quoteData.vendorId
            );
            
            if (existingQuote && existingQuote.status !== 'draft') {
                throw new ConflictError('Vendor already submitted a quote for this RFQ');
            }
            
            // Set valid until date if not provided
            if (!quoteData.validUntil) {
                const validUntil = new Date();
                validUntil.setDate(validUntil.getDate() + parseInt(QUOTE_EXPIRY_DAYS));
                quoteData.validUntil = validUntil;
            }
            
            // Create or update quote
            let quote;
            if (existingQuote) {
                quote = await this.quoteRepository.UpdateQuote(existingQuote.id, quoteData);
            } else {
                quote = await this.quoteRepository.CreateQuote(quoteData);
            }
            
            // Publish event if channel is available and status is submitted
            if (this.channel && quoteData.status === 'submitted') {
                await publishMessage(this.channel, 'quote.submitted', {
                    id: quote.id,
                    rfqId: quote.rfqId,
                    vendorId: quote.vendorId,
                    vendorName: quote.vendorName,
                    totalAmount: quote.totalAmount,
                    deliveryDate: quote.deliveryDate
                });
            }
            
            return quote;
        } catch (error) {
            logger.error(`Error creating quote: ${error.message}`);
            throw error;
        }
    }
    
    async GetQuoteById(id) {
        try {
            return await this.quoteRepository.FindQuoteById(id);
        } catch (error) {
            logger.error(`Error getting quote by ID: ${error.message}`);
            throw error;
        }
    }
    
    async GetQuotes(query) {
        try {
            return await this.quoteRepository.FindQuotes(query);
        } catch (error) {
            logger.error(`Error getting quotes: ${error.message}`);
            throw error;
        }
    }
    
    async UpdateQuote(id, updateData, userId) {
        try {
            // Get existing quote
            const existingQuote = await this.quoteRepository.FindQuoteById(id);
            
            // Check if user is authorized to update
            if (existingQuote.createdBy !== userId && !updateData.isAdmin) {
                throw new AuthorizationError('You are not authorized to update this quote');
            }
            
            // Remove isAdmin flag from update data
            if (updateData.isAdmin) {
                delete updateData.isAdmin;
            }
            
            // Check if quote can be updated
            if (existingQuote.status === 'accepted' || existingQuote.status === 'rejected') {
                throw new ValidationError('Cannot update an accepted or rejected quote');
            }
            
            const quote = await this.quoteRepository.UpdateQuote(id, updateData);
            
            // Publish event if channel is available and status changed to submitted
            if (this.channel && 
                updateData.status === 'submitted' && 
                existingQuote.status !== 'submitted') {
                await publishMessage(this.channel, 'quote.submitted', {
                    id: quote.id,
                    rfqId: quote.rfqId,
                    vendorId: quote.vendorId,
                    vendorName: quote.vendorName,
                    totalAmount: quote.totalAmount,
                    deliveryDate: quote.deliveryDate
                });
            }
            
            // Publish event if channel is available and status changed to accepted
            if (this.channel && 
                updateData.status === 'accepted' && 
                existingQuote.status !== 'accepted') {
                await publishMessage(this.channel, 'quote.accepted', {
                    id: quote.id,
                    rfqId: quote.rfqId,
                    vendorId: quote.vendorId,
                    vendorName: quote.vendorName,
                    totalAmount: quote.totalAmount,
                    deliveryDate: quote.deliveryDate
                });
                
                // Reject all other quotes for this RFQ
                const otherQuotes = await this.quoteRepository.FindQuotesByRfqId(quote.rfqId);
                for (const otherQuote of otherQuotes) {
                    if (otherQuote.id !== quote.id && otherQuote.status !== 'rejected') {
                        await this.quoteRepository.UpdateQuote(otherQuote.id, { status: 'rejected' });
                    }
                }
            }
            
            return quote;
        } catch (error) {
            logger.error(`Error updating quote: ${error.message}`);
            throw error;
        }
    }
    
    async DeleteQuote(id, userId) {
        try {
            // Get existing quote
            const existingQuote = await this.quoteRepository.FindQuoteById(id);
            
            // Check if user is authorized to delete
            if (existingQuote.createdBy !== userId && !isAdmin) {
                throw new AuthorizationError('You are not authorized to delete this quote');
            }
            
            // Check if quote can be deleted
            if (existingQuote.status !== 'draft') {
                throw new ValidationError('Only draft quotes can be deleted');
            }
            
            return await this.quoteRepository.DeleteQuote(id);
        } catch (error) {
            logger.error(`Error deleting quote: ${error.message}`);
            throw error;
        }
    }
    
    // Event handlers
    async SubscribeEvents(event, data) {
        logger.info(`Received event ${event} with data:`, data);
        
        switch (event) {
            case 'rfq.updated':
                await this.HandleRfqUpdated(data);
                break;
            default:
                break;
        }
    }
    
    async HandleRfqUpdated(data) {
        try {
            const { id, status } = data;
            
            // If RFQ is closed or expired, expire all draft quotes
            if (status === 'closed' || status === 'expired') {
                const quotes = await this.quoteRepository.FindQuotesByRfqId(id);
                
                for (const quote of quotes) {
                    if (quote.status === 'draft') {
                        await this.quoteRepository.UpdateQuote(quote.id, { status: 'expired' });
                    }
                }
            }
        } catch (error) {
            logger.error(`Error handling RFQ updated event: ${error.message}`);
        }
    }
}

module.exports = QuoteService; 