const VendorService = require('../../services/vendor-service');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('vendor-controller');

class VendorController {
    constructor(channel) {
        this.vendorService = new VendorService(channel);
    }
    
    async registerVendor(req, res, next) {
        try {
            const { body } = req;
            
            // Add createdBy if user is authenticated
            if (req.user) {
                body.createdBy = req.user.id;
            }
            
            const vendor = await this.vendorService.RegisterVendor(body);
            
            return res.status(201).json({
                status: 'success',
                data: vendor
            });
        } catch (error) {
            next(error);
        }
    }
    
    async getVendor(req, res, next) {
        try {
            const { id } = req.params;
            const vendor = await this.vendorService.GetVendor(id);
            
            return res.status(200).json({
                status: 'success',
                data: vendor
            });
        } catch (error) {
            next(error);
        }
    }
    
    async getVendors(req, res, next) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                filter: {}
            };
            
            // Add filters
            if (req.query.status) {
                options.filter.status = req.query.status;
            }
            
            if (req.query.verificationStatus) {
                options.filter.verificationStatus = req.query.verificationStatus;
            }
            
            if (req.query.businessType) {
                options.filter.businessType = req.query.businessType;
            }
            
            if (req.query.category) {
                options.filter.categories = req.query.category;
            }
            
            if (req.query.region) {
                options.filter.serviceableRegions = req.query.region;
            }
            
            if (req.query.search) {
                options.filter.$or = [
                    { businessName: { $regex: req.query.search, $options: 'i' } },
                    { legalName: { $regex: req.query.search, $options: 'i' } },
                    { 'contactPerson.email': { $regex: req.query.search, $options: 'i' } }
                ];
            }
            
            const vendors = await this.vendorService.GetVendors(options);
            
            return res.status(200).json({
                status: 'success',
                data: vendors
            });
        } catch (error) {
            next(error);
        }
    }
    
    async updateVendor(req, res, next) {
        try {
            const { id } = req.params;
            const { body } = req;
            
            const vendor = await this.vendorService.UpdateVendor(id, body);
            
            return res.status(200).json({
                status: 'success',
                data: vendor
            });
        } catch (error) {
            next(error);
        }
    }
    
    async updateVendorStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const vendor = await this.vendorService.UpdateVendorStatus(id, status);
            
            return res.status(200).json({
                status: 'success',
                data: vendor
            });
        } catch (error) {
            next(error);
        }
    }
    
    async deleteVendor(req, res, next) {
        try {
            const { id } = req.params;
            
            const vendor = await this.vendorService.DeleteVendor(id);
            
            return res.status(200).json({
                status: 'success',
                data: vendor
            });
        } catch (error) {
            next(error);
        }
    }
    
    async getVendorPerformance(req, res, next) {
        try {
            const { id } = req.params;
            
            const performance = await this.vendorService.GetVendorPerformance(id);
            
            return res.status(200).json({
                status: 'success',
                data: performance
            });
        } catch (error) {
            next(error);
        }
    }
    
    async calculateVendorPerformance(req, res, next) {
        try {
            const { id } = req.params;
            
            const performance = await this.vendorService.CalculateVendorPerformance(id);
            
            return res.status(200).json({
                status: 'success',
                data: performance
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = VendorController; 