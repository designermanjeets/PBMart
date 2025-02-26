const Rfq = require('../models/rfq');
const { NotFoundError } = require('../../utils/errors');

class RfqRepository {
    async CreateRfq(rfqData) {
        try {
            const rfq = new Rfq(rfqData);
            const result = await rfq.save();
            return result;
        } catch (error) {
            throw error;
        }
    }
    
    async FindRfqById(id) {
        try {
            const rfq = await Rfq.findById(id);
            
            if (!rfq) {
                throw new NotFoundError(`RFQ with ID ${id} not found`);
            }
            
            return rfq;
        } catch (error) {
            throw error;
        }
    }
    
    async FindRfqs(query) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                status, 
                buyerId, 
                vendorId,
                search 
            } = query;
            
            const skip = (page - 1) * limit;
            
            // Build filter
            const filter = {};
            
            if (status) {
                filter.status = status;
            }
            
            if (buyerId) {
                filter.buyerId = buyerId;
            }
            
            if (vendorId) {
                filter['invitedVendors.vendorId'] = vendorId;
            }
            
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            
            const rfqs = await Rfq.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
                
            const total = await Rfq.countDocuments(filter);
            
            return {
                rfqs,
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
    
    async UpdateRfq(id, updateData) {
        try {
            const rfq = await Rfq.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!rfq) {
                throw new NotFoundError(`RFQ with ID ${id} not found`);
            }
            
            return rfq;
        } catch (error) {
            throw error;
        }
    }
    
    async DeleteRfq(id) {
        try {
            const rfq = await Rfq.findByIdAndDelete(id);
            
            if (!rfq) {
                throw new NotFoundError(`RFQ with ID ${id} not found`);
            }
            
            return rfq;
        } catch (error) {
            throw error;
        }
    }
    
    async AddVendorToRfq(id, vendorData) {
        try {
            const rfq = await Rfq.findById(id);
            
            if (!rfq) {
                throw new NotFoundError(`RFQ with ID ${id} not found`);
            }
            
            // Check if vendor already exists
            const vendorExists = rfq.invitedVendors.some(
                vendor => vendor.vendorId === vendorData.vendorId
            );
            
            if (vendorExists) {
                // Update existing vendor
                rfq.invitedVendors = rfq.invitedVendors.map(vendor => {
                    if (vendor.vendorId === vendorData.vendorId) {
                        return {
                            ...vendor,
                            ...vendorData,
                            invitedAt: new Date()
                        };
                    }
                    return vendor;
                });
            } else {
                // Add new vendor
                rfq.invitedVendors.push({
                    ...vendorData,
                    invitedAt: new Date(),
                    status: 'pending'
                });
            }
            
            await rfq.save();
            
            return rfq;
        } catch (error) {
            throw error;
        }
    }
    
    async UpdateVendorStatus(id, vendorId, status) {
        try {
            const rfq = await Rfq.findById(id);
            
            if (!rfq) {
                throw new NotFoundError(`RFQ with ID ${id} not found`);
            }
            
            // Find vendor in invited vendors
            const vendorIndex = rfq.invitedVendors.findIndex(
                vendor => vendor.vendorId === vendorId
            );
            
            if (vendorIndex === -1) {
                throw new NotFoundError(`Vendor with ID ${vendorId} not found in RFQ`);
            }
            
            // Update vendor status
            rfq.invitedVendors[vendorIndex].status = status;
            
            await rfq.save();
            
            return rfq;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RfqRepository; 