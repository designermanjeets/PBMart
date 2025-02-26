const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VendorSchema = new Schema({
    businessName: { 
        type: String, 
        required: true 
    },
    legalName: { 
        type: String, 
        required: true 
    },
    businessType: { 
        type: String, 
        enum: ['manufacturer', 'wholesaler', 'distributor', 'retailer'],
        required: true
    },
    taxId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    registrationNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    yearEstablished: { 
        type: Number 
    },
    description: { 
        type: String 
    },
    logo: { 
        type: String 
    },
    coverImage: { 
        type: String 
    },
    contactPerson: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        position: { type: String },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    businessAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    shippingAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
    },
    bankInformation: {
        accountName: { type: String },
        accountNumber: { type: String },
        bankName: { type: String },
        routingNumber: { type: String },
        swiftCode: { type: String }
    },
    paymentTerms: { 
        type: String 
    },
    minimumOrderValue: { 
        type: Number, 
        default: 0 
    },
    serviceableRegions: [{ 
        type: String 
    }],
    categories: [{ 
        type: String 
    }],
    tags: [{ 
        type: String 
    }],
    status: { 
        type: String, 
        enum: ['pending', 'active', 'suspended', 'inactive'], 
        default: 'pending' 
    },
    verificationStatus: {
        type: String,
        enum: ['unverified', 'in_progress', 'verified', 'rejected'],
        default: 'unverified'
    },
    rating: { 
        type: Number, 
        default: 0 
    },
    totalReviews: { 
        type: Number, 
        default: 0 
    },
    createdBy: { 
        type: Schema.Types.ObjectId 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update the updatedAt field on save
VendorSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Vendor', VendorSchema); 