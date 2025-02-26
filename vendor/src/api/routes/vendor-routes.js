const express = require('express');
const router = express.Router();
const { validateSchema } = require('../middlewares/validator');
const { validateToken, isAdmin } = require('../middlewares/auth');
const {
    vendorRegistrationSchema,
    vendorUpdateSchema,
    vendorStatusUpdateSchema,
    vendorQuerySchema
} = require('../validators/vendor-validators');

module.exports = (controller) => {
    // Register a new vendor
    router.post(
        '/',
        validateSchema(vendorRegistrationSchema, 'body'),
        controller.registerVendor.bind(controller)
    );
    
    // Get all vendors (with filtering and pagination)
    router.get(
        '/',
        validateSchema(vendorQuerySchema, 'query'),
        controller.getVendors.bind(controller)
    );
    
    // Get vendor details
    router.get(
        '/:id',
        controller.getVendor.bind(controller)
    );
    
    // Update vendor information
    router.put(
        '/:id',
        validateToken,
        validateSchema(vendorUpdateSchema, 'body'),
        controller.updateVendor.bind(controller)
    );
    
    // Update vendor status
    router.patch(
        '/:id/status',
        validateToken,
        isAdmin,
        validateSchema(vendorStatusUpdateSchema, 'body'),
        controller.updateVendorStatus.bind(controller)
    );
    
    // Delete a vendor
    router.delete(
        '/:id',
        validateToken,
        isAdmin,
        controller.deleteVendor.bind(controller)
    );
    
    // Get vendor performance
    router.get(
        '/:id/performance',
        controller.getVendorPerformance.bind(controller)
    );
    
    // Calculate vendor performance
    router.post(
        '/:id/performance/calculate',
        validateToken,
        controller.calculateVendorPerformance.bind(controller)
    );
    
    return router;
}; 