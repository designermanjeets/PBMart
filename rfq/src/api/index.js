const express = require('express');
const cors = require('cors');
const RfqController = require('./controllers/rfq-controller');
const QuoteController = require('./controllers/quote-controller');
const rfqRoutes = require('./routes/rfq-routes');
const quoteRoutes = require('./routes/quote-routes');
const errorHandler = require('./middlewares/error-handler');

module.exports = (app, channel) => {
    // Initialize controllers
    const rfqController = new RfqController(channel);
    const quoteController = new QuoteController(channel);
    
    app.use('/api/quote', (req, res) => {
        // Redirect to the plural form
        const newUrl = req.url === '/' ? '/api/quotes' : `/api/quotes${req.url}`;
        res.redirect(newUrl);
    });
    
    // Root API endpoint
    app.get('/api', (req, res) => {
        res.status(200).json({
            message: 'RFQ Service API',
            version: '1.0.0',
            endpoints: [
                { path: '/api/rfq', description: 'RFQ endpoints' },
                { path: '/api/quotes', description: 'Quote endpoints' }
            ]
        });
    });
    
    // API routes
    app.use('/api/rfq', rfqRoutes(rfqController));
    app.use('/api/quotes', quoteRoutes(quoteController));
}; 