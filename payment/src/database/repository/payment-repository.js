const Payment = require('../models/Payment');
const { DatabaseError, NotFoundError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('payment-repository');

class PaymentRepository {
    async CreatePayment(paymentData) {
        try {
            const payment = new Payment(paymentData);
            const result = await payment.save();
            return result;
        } catch (err) {
            logger.error(`Error creating payment: ${err.message}`);
            throw new DatabaseError(`Error creating payment: ${err.message}`);
        }
    }

    async FindPaymentById(id) {
        try {
            const payment = await Payment.findById(id);
            
            if (!payment) {
                throw new NotFoundError(`Payment with ID ${id} not found`);
            }
            
            return payment;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error finding payment by ID: ${err.message}`);
            throw new DatabaseError(`Error finding payment: ${err.message}`);
        }
    }

    async FindPaymentByOrderId(orderId) {
        try {
            const payment = await Payment.findOne({ orderId });
            
            if (!payment) {
                throw new NotFoundError(`Payment for order ${orderId} not found`);
            }
            
            return payment;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error finding payment by order ID: ${err.message}`);
            throw new DatabaseError(`Error finding payment: ${err.message}`);
        }
    }

    async FindPaymentsByCustomerId(customerId) {
        try {
            const payments = await Payment.find({ customerId }).sort({ createdAt: -1 });
            return payments;
        } catch (err) {
            logger.error(`Error finding payments by customer ID: ${err.message}`);
            throw new DatabaseError(`Error finding payments: ${err.message}`);
        }
    }

    async UpdatePayment(id, updateData) {
        try {
            const payment = await Payment.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!payment) {
                throw new NotFoundError(`Payment with ID ${id} not found`);
            }
            
            return payment;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error updating payment: ${err.message}`);
            throw new DatabaseError(`Error updating payment: ${err.message}`);
        }
    }

    async GetPaymentStats(startDate, endDate) {
        try {
            const stats = await Payment.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        avgAmount: { $avg: '$amount' }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
            
            return stats;
        } catch (err) {
            logger.error(`Error getting payment stats: ${err.message}`);
            throw new DatabaseError(`Error getting payment stats: ${err.message}`);
        }
    }

    async FindPaymentsByDateRange(startDate, endDate) {
        try {
            const payments = await Payment.find({
                createdAt: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(endDate) 
                }
            }).sort({ createdAt: -1 });
            
            return payments;
        } catch (err) {
            logger.error(`Error finding payments by date range: ${err.message}`);
            throw new DatabaseError(`Error finding payments: ${err.message}`);
        }
    }
}

module.exports = PaymentRepository; 