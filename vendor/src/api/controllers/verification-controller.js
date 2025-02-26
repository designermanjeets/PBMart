const VerificationService = require('../../services/verification-service');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('verification-controller');

class VerificationController {
    constructor(channel) {
        this.verificationService = new VerificationService(channel);
    }
    
    async getVerification(req, res, next) {
        try {
            const { id } = req.params;
            
            const verification = await this.verificationService.GetVerification(id);
            
            return res.status(200).json({
                status: 'success',
                data: verification
            });
        } catch (error) {
            next(error);
        }
    }
    
    async getVerificationByVendor(req, res, next) {
        try {
            const { vendorId } = req.params;
            
            const verification = await this.verificationService.GetVerificationByVendor(vendorId);
            
            return res.status(200).json({
                status: 'success',
                data: verification
            });
        } catch (error) {
            next(error);
        }
    }
    
    async updateVerificationStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const updatedBy = req.user ? req.user.id : null;
            
            const verification = await this.verificationService.UpdateVerificationStatus(
                id, status, notes, updatedBy
            );
            
            return res.status(200).json({
                status: 'success',
                data: verification
            });
        } catch (error) {
            next(error);
        }
    }
    
    async uploadDocument(req, res, next) {
        try {
            const { vendorId } = req.params;
            const { documentType } = req.body;
            const file = req.file;
            
            if (!file) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'No file uploaded'
                });
            }
            
            const document = await this.verificationService.UploadDocument(
                vendorId, file, documentType
            );
            
            return res.status(201).json({
                status: 'success',
                data: document
            });
        } catch (error) {
            next(error);
        }
    }
    
    async deleteDocument(req, res, next) {
        try {
            const { verificationId, documentId } = req.params;
            
            await this.verificationService.DeleteDocument(verificationId, documentId);
            
            return res.status(200).json({
                status: 'success',
                message: 'Document deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = VerificationController; 