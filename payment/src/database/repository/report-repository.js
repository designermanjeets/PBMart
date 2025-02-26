const Report = require('../models/Report');
const { DatabaseError, NotFoundError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('report-repository');

class ReportRepository {
    async CreateReport(reportData) {
        try {
            const report = new Report(reportData);
            const result = await report.save();
            return result;
        } catch (err) {
            logger.error(`Error creating report: ${err.message}`);
            throw new DatabaseError(`Error creating report: ${err.message}`);
        }
    }

    async FindReportById(id) {
        try {
            const report = await Report.findById(id);
            
            if (!report) {
                throw new NotFoundError(`Report with ID ${id} not found`);
            }
            
            return report;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error finding report by ID: ${err.message}`);
            throw new DatabaseError(`Error finding report: ${err.message}`);
        }
    }

    async FindReportsByCreator(createdBy) {
        try {
            const reports = await Report.find({ createdBy }).sort({ createdAt: -1 });
            return reports;
        } catch (err) {
            logger.error(`Error finding reports by creator: ${err.message}`);
            throw new DatabaseError(`Error finding reports: ${err.message}`);
        }
    }

    async FindReportsByType(type) {
        try {
            const reports = await Report.find({ type }).sort({ createdAt: -1 });
            return reports;
        } catch (err) {
            logger.error(`Error finding reports by type: ${err.message}`);
            throw new DatabaseError(`Error finding reports: ${err.message}`);
        }
    }

    async UpdateReport(id, updateData) {
        try {
            const report = await Report.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!report) {
                throw new NotFoundError(`Report with ID ${id} not found`);
            }
            
            return report;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error updating report: ${err.message}`);
            throw new DatabaseError(`Error updating report: ${err.message}`);
        }
    }

    async DeleteReport(id) {
        try {
            const report = await Report.findByIdAndDelete(id);
            
            if (!report) {
                throw new NotFoundError(`Report with ID ${id} not found`);
            }
            
            return { success: true };
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error deleting report: ${err.message}`);
            throw new DatabaseError(`Error deleting report: ${err.message}`);
        }
    }
}

module.exports = ReportRepository; 