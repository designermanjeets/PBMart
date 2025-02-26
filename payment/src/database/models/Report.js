const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Report name is required']
    },
    type: {
        type: String,
        required: [true, 'Report type is required'],
        enum: {
            values: ['sales', 'revenue', 'transactions'],
            message: 'Report type must be one of: sales, revenue, transactions'
        }
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Report data is required']
    },
    filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: String,
        required: [true, 'Creator ID is required']
    },
    format: {
        type: String,
        enum: {
            values: ['json', 'csv', 'pdf'],
            message: 'Format must be one of: json, csv, pdf'
        },
        default: 'json'
    },
    fileUrl: {
        type: String
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

module.exports = mongoose.model('Report', ReportSchema); 