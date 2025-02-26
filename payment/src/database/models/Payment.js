const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: [true, 'Order ID is required']
    },
    customerId: {
        type: String,
        required: [true, 'Customer ID is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be positive']
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        enum: {
            values: ['USD', 'EUR', 'GBP'],
            message: 'Currency must be one of: USD, EUR, GBP'
        },
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: {
            values: ['credit_card', 'paypal', 'bank_transfer'],
            message: 'Payment method must be one of: credit_card, paypal, bank_transfer'
        }
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: ['pending', 'completed', 'failed', 'refunded'],
            message: 'Status must be one of: pending, completed, failed, refunded'
        },
        default: 'pending'
    },
    transactionId: {
        type: String,
        sparse: true
    },
    description: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
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

module.exports = mongoose.model('Payment', PaymentSchema); 