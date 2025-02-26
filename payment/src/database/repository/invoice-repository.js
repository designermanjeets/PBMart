const Invoice = require('../models/Invoice');
const { DatabaseError, NotFoundError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('invoice-repository');

class InvoiceRepository {
    async CreateInvoice(invoiceData) {
        try {
            const invoice = new Invoice(invoiceData);
            const result = await invoice.save();
            return result;
        } catch (err) {
            logger.error(`Error creating invoice: ${err.message}`);
            throw new DatabaseError(`Error creating invoice: ${err.message}`);
        }
    }

    async FindInvoiceById(id) {
        try {
            const invoice = await Invoice.findById(id).populate('paymentId');
            
            if (!invoice) {
                throw new NotFoundError(`Invoice with ID ${id} not found`);
            }
            
            return invoice;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error finding invoice by ID: ${err.message}`);
            throw new DatabaseError(`Error finding invoice: ${err.message}`);
        }
    }

    async FindInvoiceByNumber(invoiceNumber) {
        try {
            const invoice = await Invoice.findOne({ invoiceNumber }).populate('paymentId');
            
            if (!invoice) {
                throw new NotFoundError(`Invoice number ${invoiceNumber} not found`);
            }
            
            return invoice;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error finding invoice by number: ${err.message}`);
            throw new DatabaseError(`Error finding invoice: ${err.message}`);
        }
    }

    async FindInvoicesByCustomerId(customerId) {
        try {
            const invoices = await Invoice.find({ customerId }).sort({ createdAt: -1 });
            return invoices;
        } catch (err) {
            logger.error(`Error finding invoices by customer ID: ${err.message}`);
            throw new DatabaseError(`Error finding invoices: ${err.message}`);
        }
    }

    async UpdateInvoice(id, updateData) {
        try {
            const invoice = await Invoice.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!invoice) {
                throw new NotFoundError(`Invoice with ID ${id} not found`);
            }
            
            return invoice;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error updating invoice: ${err.message}`);
            throw new DatabaseError(`Error updating invoice: ${err.message}`);
        }
    }

    async GetInvoiceStats(startDate, endDate) {
        try {
            const stats = await Invoice.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$total' },
                        avgAmount: { $avg: '$total' }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
            
            return stats;
        } catch (err) {
            logger.error(`Error getting invoice stats: ${err.message}`);
            throw new DatabaseError(`Error getting invoice stats: ${err.message}`);
        }
    }

    async GenerateInvoiceNumber() {
        try {
            // Get the latest invoice to determine the next number
            const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });
            
            let nextNumber = 1;
            
            if (latestInvoice && latestInvoice.invoiceNumber) {
                // Extract the numeric part of the invoice number
                const match = latestInvoice.invoiceNumber.match(/INV-(\d+)/);
                if (match && match[1]) {
                    nextNumber = parseInt(match[1], 10) + 1;
                }
            }
            
            // Format with leading zeros (e.g., INV-000001)
            return `INV-${nextNumber.toString().padStart(6, '0')}`;
        } catch (err) {
            logger.error(`Error generating invoice number: ${err.message}`);
            throw new DatabaseError(`Error generating invoice number: ${err.message}`);
        }
    }
}

module.exports = InvoiceRepository; 