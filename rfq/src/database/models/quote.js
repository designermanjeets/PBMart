const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    rfqId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rfq',
        required: [true, 'RFQ ID is required']
    },
    vendorId: {
        type: String,
        required: [true, 'Vendor ID is required']
    },
    vendorName: {
        type: String,
        required: [true, 'Vendor name is required']
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
        unitPrice: {
            type: Number,
            required: [true, 'Unit price is required'],
            min: [0, 'Unit price cannot be negative']
        },
        totalPrice: {
            type: Number,
            required: [true, 'Total price is required'],
            min: [0, 'Total price cannot be negative']
        },
        notes: String
    }],
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    deliveryDate: {
        type: Date,
        required: [true, 'Delivery date is required']
    },
    validUntil: {
        type: Date,
        required: [true, 'Valid until date is required']
    },
    paymentTerms: {
        type: String
    },
    shippingTerms: {
        type: String
    },
    additionalNotes: {
        type: String
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'submitted', 'accepted', 'rejected', 'expired'],
        default: 'draft'
    },
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

module.exports = mongoose.model('Quote', QuoteSchema); 