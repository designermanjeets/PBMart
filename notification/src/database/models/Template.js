const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        unique: true
    },
    type: {
        type: String,
        required: [true, 'Template type is required'],
        enum: {
            values: ['email', 'sms', 'inapp'],
            message: 'Type must be one of: email, sms, inapp'
        }
    },
    subject: {
        type: String,
        required: function() { return this.type === 'email'; }
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    variables: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

module.exports = mongoose.model('Template', TemplateSchema); 