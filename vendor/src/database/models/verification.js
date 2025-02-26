const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VerificationSchema = new Schema({
    vendorId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Vendor', 
        required: true 
    },
    documents: [{
        type: { 
            type: String, 
            enum: ['business_registration', 'tax_certificate', 'identity_proof', 'address_proof', 'bank_statement', 'other'],
            required: true 
        },
        fileUrl: { 
            type: String, 
            required: true 
        },
        fileName: { 
            type: String, 
            required: true 
        },
        uploadedAt: { 
            type: Date, 
            default: Date.now 
        },
        status: { 
            type: String, 
            enum: ['pending', 'approved', 'rejected'], 
            default: 'pending' 
        },
        notes: { 
            type: String 
        }
    }],
    verificationHistory: [{
        status: { 
            type: String, 
            enum: ['submitted', 'in_review', 'additional_info_requested', 'approved', 'rejected'] 
        },
        notes: { 
            type: String 
        },
        timestamp: { 
            type: Date, 
            default: Date.now 
        },
        updatedBy: { 
            type: Schema.Types.ObjectId 
        }
    }],
    currentStatus: { 
        type: String, 
        enum: ['submitted', 'in_review', 'additional_info_requested', 'approved', 'rejected'],
        default: 'submitted'
    },
    submittedAt: { 
        type: Date, 
        default: Date.now 
    },
    completedAt: { 
        type: Date 
    }
});

module.exports = mongoose.model('Verification', VerificationSchema); 