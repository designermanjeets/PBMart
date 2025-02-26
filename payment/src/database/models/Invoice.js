const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required']
    },
    description: {
        type: String
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    tax: {
        type: Number,
        default: 0
    }
});

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: [true, 'Invoice number is required'],
        unique: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: [true, 'Payment ID is required']
    },
    customerId: {
        type: String,
        required: [true, 'Customer ID is required']
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required']
    },
    customerEmail: {
        type: String,
        required: [true, 'Customer email is required']
    },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    items: {
        type: [InvoiceItemSchema],
        required: [true, 'At least one item is required'],
        validate: {
            validator: function(items) {
                return items.length > 0;
            },
            message: 'At least one item is required'
        }
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required']
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: [true, 'Total is required']
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: {
            values: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
            message: 'Status must be one of: draft, sent, paid, overdue, cancelled'
        },
        default: 'draft'
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    pdfUrl: {
        type: String
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

module.exports = mongoose.model('Invoice', InvoiceSchema); 