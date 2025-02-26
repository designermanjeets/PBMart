const express = require('express');
const { validateToken, isAdmin, isBuyer } = require('../middlewares/auth');

module.exports = (controller) => {
    const router = express.Router();
    
    // Apply auth middleware to all routes
    router.use(validateToken);
    
    // RFQ routes
    router.post('/', controller.CreateRfq.bind(controller));
    router.get('/', controller.GetRfqs.bind(controller));
    router.get('/:id', controller.GetRfqById.bind(controller));
    router.put('/:id', controller.UpdateRfq.bind(controller));
    router.delete('/:id', controller.DeleteRfq.bind(controller));
    
    // Vendor invitation routes
    router.post('/:id/vendors', controller.InviteVendors.bind(controller));
    router.put('/:id/vendors/:vendorId', controller.UpdateVendorStatus.bind(controller));
    
    // Quote routes for RFQ
    router.get('/:id/quotes', controller.GetQuotesForRfq.bind(controller));
    
    return router;
}; 