const VerificationRepository = require('../database/repository/verification-repository');
const VendorRepository = require('../database/repository/vendor-repository');
const FileStorageService = require('./file-storage-service');
const { publishMessage } = require('../utils/message-broker');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('verification-service');

class VerificationService {
    constructor(channel) {
        this.channel = channel;
        this.verificationRepository = new VerificationRepository();
        this.vendorRepository = new VendorRepository();
        this.fileStorageService = new FileStorageService();
    }
    
    async SubmitVerification(vendorId, documents) {
        try {
            // Check if vendor exists
            await this.vendorRepository.FindVendor(vendorId);
            
            // Update vendor verification status
            await this.vendorRepository.UpdateVendorVerificationStatus(vendorId, 'in_progress');
            
            // Create verification record
            const verification = await this.verificationRepository.CreateVerification({
                vendorId,
                documents
            });
            
            // Publish event
            if (this.channel) {
                await publishMessage(this.channel, 'vendor.verification_submitted', {
                    vendorId,
                    verificationId: verification._id
                });
            }
            
            return verification;
        } catch (error) {
            logger.error(`Error submitting verification: ${error.message}`);
            throw error;
        }
    }
    
    async GetVerification(id) {
        try {
            return await this.verificationRepository.FindVerification(id);
        } catch (error) {
            logger.error(`Error getting verification: ${error.message}`);
            throw error;
        }
    }
    
    async GetVerificationByVendor(vendorId) {
        try {
            return await this.verificationRepository.FindVerificationByVendor(vendorId);
        } catch (error) {
            logger.error(`Error getting verification by vendor: ${error.message}`);
            throw error;
        }
    }
    
    async UpdateVerificationStatus(id, status, notes, updatedBy) {
        try {
            const verification = await this.verificationRepository.UpdateVerificationStatus(
                id, status, notes, updatedBy
            );
            
            // Update vendor verification status
            if (status === 'approved') {
                await this.vendorRepository.UpdateVendorVerificationStatus(
                    verification.vendorId, 'verified'
                );
                
                // Also update vendor status to active if it's pending
                const vendor = await this.vendorRepository.FindVendor(verification.vendorId);
                if (vendor.status === 'pending') {
                    await this.vendorRepository.UpdateVendorStatus(verification.vendorId, 'active');
                }
                
                // Publish event
                if (this.channel) {
                    await publishMessage(this.channel, 'vendor.verified', {
                        vendorId: verification.vendorId,
                        verificationId: verification._id
                    });
                }
            } else if (status === 'rejected') {
                await this.vendorRepository.UpdateVendorVerificationStatus(
                    verification.vendorId, 'rejected'
                );
            }
            
            return verification;
        } catch (error) {
            logger.error(`Error updating verification status: ${error.message}`);
            throw error;
        }
    }
    
    async UploadDocument(vendorId, file, documentType) {
        try {
            // Check if vendor exists
            await this.vendorRepository.FindVendor(vendorId);
            
            // Upload file
            const { fileName, fileUrl } = await this.fileStorageService.uploadFile(
                file, `vendors/${vendorId}/documents`
            );
            
            // Create document object
            const document = {
                type: documentType,
                fileUrl,
                fileName,
                uploadedAt: new Date(),
                status: 'pending'
            };
            
            // Check if verification exists
            try {
                const verification = await this.verificationRepository.FindVerificationByVendor(vendorId);
                
                // Add document to existing verification
                verification.documents.push(document);
                verification.verificationHistory.push({
                    status: 'submitted',
                    notes: `Document uploaded: ${documentType}`,
                    timestamp: new Date()
                });
                
                if (verification.currentStatus === 'rejected') {
                    verification.currentStatus = 'submitted';
                    verification.submittedAt = new Date();
                    
                    // Update vendor verification status
                    await this.vendorRepository.UpdateVendorVerificationStatus(vendorId, 'in_progress');
                }
                
                await verification.save();
                
                return document;
            } catch (error) {
                if (error instanceof NotFoundError) {
                    // Create new verification
                    const verification = await this.verificationRepository.CreateVerification({
                        vendorId,
                        documents: [document]
                    });
                    
                    // Update vendor verification status
                    await this.vendorRepository.UpdateVendorVerificationStatus(vendorId, 'in_progress');
                    
                    return document;
                }
                throw error;
            }
        } catch (error) {
            logger.error(`Error uploading document: ${error.message}`);
            throw error;
        }
    }
    
    async DeleteDocument(verificationId, documentId) {
        try {
            const verification = await this.verificationRepository.FindVerification(verificationId);
            
            // Find document
            const document = verification.documents.id(documentId);
            
            if (!document) {
                throw new NotFoundError(`Document with ID ${documentId} not found`);
            }
            
            // Delete file
            await this.fileStorageService.deleteFile(document.fileUrl);
            
            // Remove document from verification
            return await this.verificationRepository.DeleteDocument(verificationId, documentId);
        } catch (error) {
            logger.error(`Error deleting document: ${error.message}`);
            throw error;
        }
    }
}

module.exports = VerificationService; 