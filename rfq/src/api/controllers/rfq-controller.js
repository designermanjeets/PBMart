const RfqService = require('../../services/rfq-service');
const { ValidationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('rfq-controller');

class RfqController {
    constructor(channel) {
        this.rfqService = new RfqService(channel);
    }
    
    async CreateRfq(req, res, next) {
        try {
            const { body } = req;
            const { id, role } = req.user;
            
            // Validate that the user is a buyer
            if (role !== 'buyer' && role !== 'admin') {
                throw new ValidationError('Only buyers can create RFQs');
            }
            
            // Set the creator ID
            body.createdBy = id;
            
            // Set buyer ID and name if not provided
            if (!body.buyerId) {
                body.buyerId = id;
            }
            
            if (!body.buyerName && req.user.name) {
                body.buyerName = req.user.name;
            }
            
            const result = await this.rfqService.CreateRfq(body);
            
            return res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async GetRfqById(req, res, next) {
        try {
            const { id } = req.params;
            
            const result = await this.rfqService.GetRfqById(id);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async GetRfqs(req, res, next) {
        try {
            const { query } = req;
            const { id, role } = req.user;
            
            // Filter RFQs based on user role
            if (role === 'buyer') {
                query.buyerId = id;
            } else if (role === 'vendor') {
                query.vendorId = id;
            }
            
            const result = await this.rfqService.GetRfqs(query);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async UpdateRfq(req, res, next) {
        try {
            const { id } = req.params;
            const { body } = req;
            const { id: userId, role } = req.user;
            
            // Set isAdmin flag if user is admin
            if (role === 'admin') {
                body.isAdmin = true;
            }
            
            const result = await this.rfqService.UpdateRfq(id, body, userId);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async DeleteRfq(req, res, next) {
        try {
            const { id } = req.params;
            const { id: userId, role } = req.user;
            
            // Set isAdmin flag if user is admin
            const isAdmin = role === 'admin';
            
            const result = await this.rfqService.DeleteRfq(id, userId, isAdmin);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async InviteVendors(req, res, next) {
        try {
            const { id } = req.params;
            const { vendors } = req.body;
            const { id: userId, role } = req.user;
            
            // Validate vendors array
            if (!Array.isArray(vendors) || vendors.length === 0) {
                throw new ValidationError('Vendors must be a non-empty array');
            }
            
            // Set isAdmin flag if user is admin
            const isAdmin = role === 'admin';
            
            const result = await this.rfqService.InviteVendors(id, vendors, userId, isAdmin);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async UpdateVendorStatus(req, res, next) {
        try {
            const { id, vendorId } = req.params;
            const { status } = req.body;
            const { id: userId } = req.user;
            
            const result = await this.rfqService.UpdateVendorStatus(id, vendorId, status, userId);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
    
    async GetQuotesForRfq(req, res, next) {
        try {
            const { id } = req.params;
            
            const result = await this.rfqService.GetQuotesForRfq(id);
            
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RfqController; 