const express = require('express');
const { createLogger } = require('../utils/logger');
const logger = createLogger('api-index');

module.exports = {
    notification: require('./notification'),
    template: require('./template')
};

// Add a root route handler
module.exports.setupRootRoutes = (app) => {
    app.get('/api/notification', (req, res) => {
        res.json({
            message: 'Notification Service API',
            version: '1.0.0',
            endpoints: [
                '/api/notification/email',
                '/api/notification/sms',
                '/api/notification/inapp',
                '/api/notification/user',
                '/api/notification/user/unread-count',
                '/api/notification/user/read-all',
                '/api/notification/:id',
                '/api/notification/:id/read',
                '/api/notification/template',
                '/api/notification/health'
            ]
        });
    });
}; 