const mongoose = require('mongoose');

const SearchAnalyticsSchema = new mongoose.Schema({
    userId: {
        type: String,
        index: true
    },
    searchQuery: {
        type: String,
        required: true,
        index: true
    },
    filters: {
        type: Object,
        default: {}
    },
    resultCount: {
        type: Number,
        default: 0
    },
    clickedResults: [{
        type: String
    }],
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
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

module.exports = mongoose.model('SearchAnalytics', SearchAnalyticsSchema); 