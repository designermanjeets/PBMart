const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TenantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    companyDescription: {
        type: String
    },
    logo: {
        type: String
    },
    address: {
        type: Object,
        properties: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        }
    },
    businessType: {
        type: String,
        enum: ['manufacturer', 'wholesaler', 'retailer', 'service_provider'],
        required: true
    },
    gstNumber: {
        type: String
    },
    panNumber: {
        type: String
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free'
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'expired'],
        default: 'active'
    },
    subscriptionExpiry: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tenant', TenantSchema); 