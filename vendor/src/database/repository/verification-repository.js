const Verification = require('../models/verification');
const { NotFoundError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('verification-repository');

class VerificationRepository {
    async CreateVerification(verificationData) {
        try {
            // Check if verification already exists for this vendor
            const existingVerification = await Verification.findOne({ 
                vendorId: verificationData.vendorId 
            });
            
            if (existingVerification) {
                // Update existing verification
                existingVerification.documents.push(...verificationData.documents);
                existingVerification.verificationHistory.push({
                    status: 'submitted',
                    notes: 'Additional documents submitted',
                    timestamp: Date.now()
                });
                existingVerification.currentStatus = 'submitted';
                existingVerification.submittedAt = Date.now();
                
                const updatedVerification = await existingVerification.save();
                return updatedVerification;
            }
            
            // Create new verification
            const verification = new Verification({
                ...verificationData,
                verificationHistory: [{
                    status: 'submitted',
                    notes: 'Initial submission',
                    timestamp: Date.now()
                }]
            });
            
            const result = await verification.save();
            return result;
        } catch (error) {
            logger.error(`Error creating verification: ${error.message}`);
            throw error;
        }
    }

    async FindVerification(id) {
        try {
            const verification = await Verification.findById(id);
            
            if (!verification) {
                throw new NotFoundError(`Verification with ID ${id} not found`);
            }
            
            return verification;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error finding verification: ${error.message}`);
            throw error;
        }
    }

    async FindVerificationByVendor(vendorId) {
        try {
            const verification = await Verification.findOne({ vendorId });
            
            if (!verification) {
                throw new NotFoundError(`Verification for vendor ID ${vendorId} not found`);
            }
            
            return verification;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error finding verification by vendor: ${error.message}`);
            throw error;
        }
    }

    async UpdateVerificationStatus(id, status, notes, updatedBy) {
        try {
            const verification = await Verification.findById(id);
            
            if (!verification) {
                throw new NotFoundError(`Verification with ID ${id} not found`);
            }
            
            // Update status
            verification.currentStatus = status;
            
            // Add to history
            verification.verificationHistory.push({
                status,
                notes,
                timestamp: Date.now(),
                updatedBy
            });
            
            // If approved or rejected, set completedAt
            if (status === 'approved' || status === 'rejected') {
                verification.completedAt = Date.now();
            }
            
            const updatedVerification = await verification.save();
            return updatedVerification;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error updating verification status: ${error.message}`);
            throw error;
        }
    }

    async UpdateDocumentStatus(id, documentId, status, notes) {
        try {
            const verification = await Verification.findById(id);
            
            if (!verification) {
                throw new NotFoundError(`Verification with ID ${id} not found`);
            }
            
            // Find the document
            const document = verification.documents.id(documentId);
            
            if (!document) {
                throw new NotFoundError(`Document with ID ${documentId} not found`);
            }
            
            // Update document status
            document.status = status;
            document.notes = notes;
            
            const updatedVerification = await verification.save();
            return updatedVerification;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error updating document status: ${error.message}`);
            throw error;
        }
    }

    async DeleteDocument(id, documentId) {
        try {
            const verification = await Verification.findById(id);
            
            if (!verification) {
                throw new NotFoundError(`Verification with ID ${id} not found`);
            }
            
            // Find and remove the document
            verification.documents.id(documentId).remove();
            
            const updatedVerification = await verification.save();
            return updatedVerification;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error deleting document: ${error.message}`);
            throw error;
        }
    }
}

module.exports = VerificationRepository; 