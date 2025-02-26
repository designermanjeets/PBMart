const express = require('express');
const cors = require('cors');
const VendorController = require('./controllers/vendor-controller');
const VerificationController = require('./controllers/verification-controller');
const vendorRoutes = require('./routes/vendor-routes');
const verificationRoutes = require('./routes/verification-routes');
const errorHandler = require('./middlewares/error-handler');

module.exports = (app, channel) => {
    app.use(express.json());
    app.use(cors());
    
    // Initialize controllers
    const vendorController = new VendorController(channel);
    const verificationController = new VerificationController(channel);
   
    // API routes - use singular form consistently
    app.use('/api/vendor', vendorRoutes(vendorController));
    app.use('/api/verifications', verificationRoutes(verificationController));
    
    // Serve uploaded files (for local storage)
    app.use('/uploads', express.static('uploads'));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'Vendor service is running'
        });
    });
    
    // Error handling middleware
    app.use(errorHandler);
}; 