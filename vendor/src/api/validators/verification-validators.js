const Joi = require('joi');

// Document upload schema
const documentUploadSchema = Joi.object({
    documentType: Joi.string().valid(
        'business_registration', 
        'tax_certificate', 
        'identity_proof', 
        'address_proof', 
        'bank_statement', 
        'other'
    ).required()
});

// Verification status update schema
const verificationStatusUpdateSchema = Joi.object({
    status: Joi.string().valid(
        'in_review', 
        'additional_info_requested', 
        'approved', 
        'rejected'
    ).required(),
    notes: Joi.string().allow('', null)
});

// Document status update schema
const documentStatusUpdateSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
    notes: Joi.string().allow('', null)
});

module.exports = {
    documentUploadSchema,
    verificationStatusUpdateSchema,
    documentStatusUpdateSchema
}; 