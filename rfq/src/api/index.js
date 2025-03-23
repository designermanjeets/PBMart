const express = require('express');
const cors = require('cors');
const RfqController = require('./controllers/rfq-controller');
const QuoteController = require('./controllers/quote-controller');
const rfqRoutes = require('./routes/rfq-routes');
const quoteRoutes = require('./routes/quote-routes');
const errorHandler = require('./middlewares/error-handler');
const { createLogger } = require('../utils/logger');

const logger = createLogger('api');

module.exports = (app, channel) => {
    // Initialize controllers
    const rfqController = new RfqController(channel);
    const quoteController = new QuoteController(channel);
    
    // Middleware
    app.use(express.json());
    app.use(cors());
    
    // Root API endpoint
    app.get('/api', (req, res) => {
        res.status(200).json({
            message: 'RFQ Service API',
            version: '1.0.0',
            endpoints: [
                { path: '/api/rfq', description: 'RFQ endpoints' }
            ]
        });
    });
    
    // API routes
    app.use('/api/rfq', rfqRoutes);
    
    // Error handling middleware
    app.use(errorHandler);
    
    logger.info('API routes registered');
}; 