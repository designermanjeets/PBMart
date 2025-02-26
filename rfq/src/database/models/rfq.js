const mongoose = require('mongoose');

const RfqSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    buyerId: {
        type: String,
        required: [true, 'Buyer ID is required']
    },
    buyerName: {
        type: String,
        required: [true, 'Buyer name is required']
    },
    items: [{
        productId: {
            type: String,
            required: [true, 'Product ID is required']
        },
        productName: {
            type: String,
            required: [true, 'Product name is required']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1']
        },
        unit: {
            type: String,
            required: [true, 'Unit is required']
        },
        specifications: {
            type: Object,
            default: {}
        }
    }],
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    deliveryDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'closed', 'expired', 'cancelled'],
        default: 'draft'
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    additionalRequirements: {
        type: String
    },
    targetPrice: {
        type: Number
    },
    invitedVendors: [{
        vendorId: String,
        vendorName: String,
        invitedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        }
    }],
    createdBy: {
        type: String,
        required: [true, 'Created by is required']
    }
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

module.exports = mongoose.model('Rfq', RfqSchema); 