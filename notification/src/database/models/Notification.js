const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required']
    },
    type: {
        type: String,
        required: [true, 'Notification type is required'],
        enum: {
            values: ['email', 'sms', 'inapp'],
            message: 'Type must be one of: email, sms, inapp'
        }
    },
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'sent', 'failed', 'read'],
            message: 'Status must be one of: pending, sent, failed, read'
        },
        default: 'pending'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    sentAt: {
        type: Date
    },
    readAt: {
        type: Date
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

module.exports = mongoose.model('Notification', NotificationSchema); 