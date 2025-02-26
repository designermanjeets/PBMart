const QuoteService = require('../../services/quote-service');
const { ValidationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('quote-controller');

class QuoteController {
    constructor(channel) {
        this.quoteService = new QuoteService(channel);
    }
    
    async CreateQuote(req, res, next) {
        try {
            const { body } = req;
            const { id, role, name } = req.user;
            
            // Validate that the user is a vendor
            if (role !== 'vendor' && role !== 'admin') {
                throw new ValidationError('Only vendors can create quotes');
            }
            
            // Set the creator ID
            body.createdBy = id;
            
            // Set vendor ID and name if not provided
            if (!body.vendorId) {
                body.vendorId = id;
            }
            
            if (!body.vendorName && name) {
                body.vendorName = name;
            }
            
            const result = await this.quoteService.CreateQuote(body);
            
            return res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async GetQuoteById(req, res, next) {
        try {
            const { id } = req.params;
            
            const result = await this.quoteService.GetQuoteById(id);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async GetQuotes(req, res, next) {
        try {
            const { query } = req;
            const { id, role } = req.user;
            
            // Filter quotes based on user role
            if (role === 'vendor') {
                query.vendorId = id;
            }
            
            const result = await this.quoteService.GetQuotes(query);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async UpdateQuote(req, res, next) {
        try {
            const { id } = req.params;
            const { body } = req;
            const { id: userId, role } = req.user;
            
            // Set isAdmin flag if user is admin
            if (role === 'admin') {
                body.isAdmin = true;
            }
            
            const result = await this.quoteService.UpdateQuote(id, body, userId);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async DeleteQuote(req, res, next) {
        try {
            const { id } = req.params;
            const { id: userId, role } = req.user;
            
            // Set isAdmin flag if user is admin
            const isAdmin = role === 'admin';
            
            const result = await this.quoteService.DeleteQuote(id, userId, isAdmin);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = QuoteController; 