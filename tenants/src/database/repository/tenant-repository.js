const { Tenant } = require('../models');
const { APIError, BadRequestError } = require('../../utils/app-errors');
const mongoose = require('mongoose');

class TenantRepository {
    async CreateTenant({ name, email, password, phone, companyName, businessType, address }) {
        try {
            const tenant = new Tenant({
                name,
                email,
                password,
                phone,
                companyName,
                businessType,
                address
            });

            const tenantResult = await tenant.save();
            return tenantResult;
        } catch (err) {
            if (err.code === 11000) {
                throw new BadRequestError('Email already exists');
            }
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Tenant');
        }
    }

    async FindTenant({ email }) {
        try {
            const existingTenant = await Tenant.findOne({ email });
            return existingTenant;
        } catch (err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Error finding tenant');
        }
    }

    async FindTenantById(id) {
        try {
            const existingTenant = await Tenant.findById(id);
            return existingTenant;
        } catch (err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Error finding tenant by ID');
        }
    }

    async UpdateTenant(tenantId, updates) {
        try {
            const tenant = await Tenant.findByIdAndUpdate(
                tenantId,
                updates,
                { new: true }
            );
            return tenant;
        } catch (err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Error updating tenant');
        }
    }

    async GetTenants(query = {}, options = { limit: 10, page: 1 }) {
        try {
            const skip = (options.page - 1) * options.limit;
            const tenants = await Tenant.find(query)
                .skip(skip)
                .limit(options.limit);
            
            const total = await Tenant.countDocuments(query);
            
            return {
                tenants,
                pagination: {
                    total,
                    page: options.page,
                    limit: options.limit,
                    pages: Math.ceil(total / options.limit)
                }
            };
        } catch (err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Error fetching tenants');
        }
    }

    async DeleteTenant(tenantId) {
        try {
            return await Tenant.findByIdAndDelete(tenantId);
        } catch (err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Error deleting tenant');
        }
    }

    async checkConnection() {
        try {
            // Check if mongoose connection is established
            return mongoose.connection.readyState === 1; // 1 = connected
        } catch (err) {
            console.log('Database connection check failed:', err);
            return false;
        }
    }
}

module.exports = TenantRepository; 