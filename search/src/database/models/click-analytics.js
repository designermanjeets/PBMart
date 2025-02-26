const mongoose = require('mongoose');

const ClickAnalyticsSchema = new mongoose.Schema({
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
    productId: {
        type: String,
        required: true,
        index: true
    },
    position: {
        type: Number
    },
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
});

module.exports = mongoose.model('ClickAnalytics', ClickAnalyticsSchema); 