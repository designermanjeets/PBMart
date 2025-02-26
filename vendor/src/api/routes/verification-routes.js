const express = require('express');
const router = express.Router();
const multer = require('multer');
const { validateSchema } = require('../middlewares/validator');
const { validateToken, isAdmin } = require('../middlewares/auth');
const {
    documentUploadSchema,
    verificationStatusUpdateSchema,
    documentStatusUpdateSchema
} = require('../validators/verification-validators');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = (controller) => {
    // Get verification details
    router.get(
        '/:id',
        controller.getVerification.bind(controller)
    );
    
    // Get verification by vendor
    router.get(
        '/vendor/:vendorId',
        controller.getVerificationByVendor.bind(controller)
    );
    
    // Update verification status
    router.patch(
        '/:id/status',
        validateToken,
        isAdmin,
        validateSchema(verificationStatusUpdateSchema, 'body'),
        controller.updateVerificationStatus.bind(controller)
    );
    
    // Upload document
    router.post(
        '/vendor/:vendorId/documents',
        validateToken,
        upload.single('document'),
        validateSchema(documentUploadSchema, 'body'),
        controller.uploadDocument.bind(controller)
    );
    
    // Delete document
    router.delete(
        '/:verificationId/documents/:documentId',
        validateToken,
        controller.deleteDocument.bind(controller)
    );
    
    return router;
}; 