const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PerformanceSchema = new Schema({
    vendorId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vendor', 
        required: true 
    },
    metrics: {
        fulfillmentRate: { type: Number, default: 0 }, // % of orders fulfilled successfully
        onTimeDelivery: { type: Number, default: 0 }, // % of orders delivered on time
        returnRate: { type: Number, default: 0 }, // % of orders returned
        cancellationRate: { type: Number, default: 0 }, // % of orders canceled
        responseTime: { type: Number, default: 0 }, // avg time to respond to inquiries (hours)
        disputeRate: { type: Number, default: 0 } // % of orders with disputes
    },
    monthlyPerformance: [{
        month: { 
            type: Date, 
            required: true 
        },
        sales: { 
            type: Number, 
            default: 0 
        },
        orders: { 
            type: Number, 
            default: 0 
        },
        fulfillmentRate: { 
            type: Number, 
            default: 0 
        },
        onTimeDelivery: { 
            type: Number, 
            default: 0 
        },
        returnRate: { 
            type: Number, 
            default: 0 
        }
    }],
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Performance', PerformanceSchema); 