const mongoose = require('mongoose');

const SearchAnalyticsSchema = new mongoose.Schema({
    userId: {
        type: String,
        index: true
    },
    tenantId: {
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
    sessionId: {
        type: String,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('SearchAnalytics', SearchAnalyticsSchema); 