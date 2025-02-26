const Quote = require('../models/quote');
const { NotFoundError } = require('../../utils/errors');

class QuoteRepository {
    async CreateQuote(quoteData) {
        try {
            const quote = new Quote(quoteData);
            const result = await quote.save();
            return result;
        } catch (error) {
            throw error;
        }
    }
    
    async FindQuoteById(id) {
        try {
            const quote = await Quote.findById(id);
            
            if (!quote) {
                throw new NotFoundError(`Quote with ID ${id} not found`);
            }
            
            return quote;
        } catch (error) {
            throw error;
        }
    }
    
    async FindQuotesByRfqId(rfqId) {
        try {
            const quotes = await Quote.find({ rfqId });
            return quotes;
        } catch (error) {
            throw error;
        }
    }
    
    async FindQuoteByRfqAndVendor(rfqId, vendorId) {
        try {
            const quote = await Quote.findOne({ rfqId, vendorId });
            return quote;
        } catch (error) {
            throw error;
        }
    }
    
    async FindQuotes(query) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                status, 
                rfqId, 
                vendorId 
            } = query;
            
            const skip = (page - 1) * limit;
            
            // Build filter
            const filter = {};
            
            if (status) {
                filter.status = status;
            }
            
            if (rfqId) {
                filter.rfqId = rfqId;
            }
            
            if (vendorId) {
                filter.vendorId = vendorId;
            }
            
            const quotes = await Quote.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
                
            const total = await Quote.countDocuments(filter);
            
            return {
                quotes,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }
    
    async UpdateQuote(id, updateData) {
        try {
            const quote = await Quote.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!quote) {
                throw new NotFoundError(`Quote with ID ${id} not found`);
            }
            
            return quote;
        } catch (error) {
            throw error;
        }
    }
    
    async DeleteQuote(id) {
        try {
            const quote = await Quote.findByIdAndDelete(id);
            
            if (!quote) {
                throw new NotFoundError(`Quote with ID ${id} not found`);
            }
            
            return quote;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = QuoteRepository; 