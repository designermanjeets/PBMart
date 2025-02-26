const Vendor = require('../models/vendor');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('vendor-repository');

class VendorRepository {
    async CreateVendor(vendorData) {
        try {
            // Check if vendor with same tax ID or registration number already exists
            const existingVendor = await Vendor.findOne({
                $or: [
                    { taxId: vendorData.taxId },
                    { registrationNumber: vendorData.registrationNumber }
                ]
            });

            if (existingVendor) {
                throw new ConflictError('Vendor with the same tax ID or registration number already exists');
            }

            const vendor = new Vendor(vendorData);
            const result = await vendor.save();
            return result;
        } catch (error) {
            if (error instanceof ConflictError) {
                throw error;
            }
            logger.error(`Error creating vendor: ${error.message}`);
            throw error;
        }
    }

    async FindVendor(id) {
        try {
            const vendor = await Vendor.findById(id);
            
            if (!vendor) {
                throw new NotFoundError(`Vendor with ID ${id} not found`);
            }
            
            return vendor;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error finding vendor: ${error.message}`);
            throw error;
        }
    }

    async FindVendorByTaxId(taxId) {
        try {
            const vendor = await Vendor.findOne({ taxId });
            
            if (!vendor) {
                throw new NotFoundError(`Vendor with tax ID ${taxId} not found`);
            }
            
            return vendor;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error finding vendor by tax ID: ${error.message}`);
            throw error;
        }
    }

    async FindVendors(query = {}, options = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                sort = { createdAt: -1 },
                status,
                verificationStatus,
                businessType,
                category,
                search
            } = options;

            const skip = (page - 1) * limit;
            const findQuery = { ...query };

            // Add filters if provided
            if (status) {
                findQuery.status = status;
            }
            
            if (verificationStatus) {
                findQuery.verificationStatus = verificationStatus;
            }
            
            if (businessType) {
                findQuery.businessType = businessType;
            }
            
            if (category) {
                findQuery.categories = { $in: [category] };
            }
            
            // Add search functionality
            if (search) {
                findQuery.$or = [
                    { businessName: { $regex: search, $options: 'i' } },
                    { legalName: { $regex: search, $options: 'i' } },
                    { 'contactPerson.email': { $regex: search, $options: 'i' } }
                ];
            }

            // Execute query with pagination
            const vendors = await Vendor.find(findQuery)
                .sort(sort)
                .skip(skip)
                .limit(limit);

            // Get total count for pagination
            const total = await Vendor.countDocuments(findQuery);

            return {
                vendors,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error(`Error finding vendors: ${error.message}`);
            throw error;
        }
    }

    async UpdateVendor(id, updates) {
        try {
            const vendor = await Vendor.findById(id);
            
            if (!vendor) {
                throw new NotFoundError(`Vendor with ID ${id} not found`);
            }
            
            // Update the vendor
            Object.keys(updates).forEach(key => {
                vendor[key] = updates[key];
            });
            
            vendor.updatedAt = Date.now();
            
            const updatedVendor = await vendor.save();
            return updatedVendor;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error updating vendor: ${error.message}`);
            throw error;
        }
    }

    async UpdateVendorStatus(id, status) {
        try {
            const vendor = await Vendor.findById(id);
            
            if (!vendor) {
                throw new NotFoundError(`Vendor with ID ${id} not found`);
            }
            
            vendor.status = status;
            vendor.updatedAt = Date.now();
            
            const updatedVendor = await vendor.save();
            return updatedVendor;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error updating vendor status: ${error.message}`);
            throw error;
        }
    }

    async UpdateVendorVerificationStatus(id, verificationStatus) {
        try {
            const vendor = await Vendor.findById(id);
            
            if (!vendor) {
                throw new NotFoundError(`Vendor with ID ${id} not found`);
            }
            
            vendor.verificationStatus = verificationStatus;
            vendor.updatedAt = Date.now();
            
            const updatedVendor = await vendor.save();
            return updatedVendor;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error updating vendor verification status: ${error.message}`);
            throw error;
        }
    }

    async DeleteVendor(id) {
        try {
            const vendor = await Vendor.findById(id);
            
            if (!vendor) {
                throw new NotFoundError(`Vendor with ID ${id} not found`);
            }
            
            // Soft delete by changing status to inactive
            vendor.status = 'inactive';
            vendor.updatedAt = Date.now();
            
            const deletedVendor = await vendor.save();
            return deletedVendor;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error deleting vendor: ${error.message}`);
            throw error;
        }
    }

    async UpdateVendorRating(id, rating, totalReviews) {
        try {
            const vendor = await Vendor.findById(id);
            
            if (!vendor) {
                throw new NotFoundError(`Vendor with ID ${id} not found`);
            }
            
            vendor.rating = rating;
            vendor.totalReviews = totalReviews;
            vendor.updatedAt = Date.now();
            
            const updatedVendor = await vendor.save();
            return updatedVendor;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error updating vendor rating: ${error.message}`);
            throw error;
        }
    }
}

module.exports = VendorRepository; 