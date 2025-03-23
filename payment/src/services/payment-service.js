const { PaymentError, NotFoundError, ValidationError } = require('../utils/errors');
const PaymentRepository = require('../database/repository/payment-repository');
const Payment = require('../database/models/Payment');
const { createLogger } = require('../utils/logger');
const logger = createLogger('payment-service');
const { STRIPE_SECRET_KEY } = require('../config');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

class PaymentService {
    constructor() {
        this.repository = new PaymentRepository();
    }

    async ProcessPayment(paymentData) {
        try {
            const { orderId, customerId, amount, currency, paymentMethod, description } = paymentData;
            
            logger.info(`Processing ${paymentMethod} payment for order ${orderId}`);
            
            // Create payment record using the repository instead of direct model
            const paymentInput = {
                orderId,
                customerId,
                amount,
                currency,
                paymentMethod,
                description,
                status: 'pending'
            };
            
            // Use repository to create payment
            const payment = await this.repository.CreatePayment(paymentInput);
            
            // For testing: Skip actual payment processing and simulate success
            logger.info(`[TEST MODE] Simulating successful payment for ${paymentMethod}`);
            
            // Update payment status to completed
            const updatedPayment = await this.repository.UpdatePayment(payment.id, {
                status: 'completed',
                transactionId: `mock-txn-${Date.now()}`,
                processedAt: new Date()
            });
            
            return updatedPayment;
            
            /* Real implementation (uncomment when ready)
            // Process payment based on payment method
            let result;
            
            switch (paymentMethod) {
                case 'credit_card':
                    result = await this.processCreditCardPayment(payment);
                    break;
                case 'paypal':
                    result = await this.processPayPalPayment(payment);
                    break;
                case 'bank_transfer':
                    result = await this.processBankTransferPayment(payment);
                    break;
                default:
                    throw new ValidationError(`Unsupported payment method: ${paymentMethod}`);
            }
            
            return result;
            */
        } catch (err) {
            logger.error(`Error processing payment: ${err.message}`);
            throw new PaymentError(`Payment processing failed: ${err.message}`);
        }
    }

    async GetPaymentById(id) {
        try {
            return await this.repository.FindPaymentById(id);
        } catch (err) {
            logger.error(`Error getting payment by ID: ${err.message}`);
            throw err;
        }
    }

    async GetPaymentByOrderId(orderId) {
        try {
            return await this.repository.FindPaymentByOrderId(orderId);
        } catch (err) {
            logger.error(`Error getting payment by order ID: ${err.message}`);
            throw err;
        }
    }

    async GetPaymentsByCustomerId(customerId) {
        try {
            return await this.repository.FindPaymentsByCustomerId(customerId);
        } catch (err) {
            logger.error(`Error getting payments by customer ID: ${err.message}`);
            throw err;
        }
    }

    async UpdatePaymentStatus(id, status) {
        try {
            return await this.repository.UpdatePayment(id, { status });
        } catch (err) {
            logger.error(`Error updating payment status: ${err.message}`);
            throw err;
        }
    }

    async GetPaymentStats(startDate, endDate) {
        try {
            return await this.repository.GetPaymentStats(startDate, endDate);
        } catch (err) {
            logger.error(`Error getting payment stats: ${err.message}`);
            throw err;
        }
    }

    // Handle events from other services
    async SubscribeEvents(payload) {
        const { event, data } = payload;
        
        logger.info(`Received event: ${event}`);
        
        switch (event) {
            case 'ORDER_CANCELLED':
                // Update payment status to refunded if it exists
                try {
                    const payment = await this.repository.FindPaymentByOrderId(data.id);
                    if (payment && payment.status === 'completed') {
                        await this.repository.UpdatePayment(payment.id, { status: 'refunded' });
                        logger.info(`Payment ${payment.id} marked as refunded due to order cancellation`);
                    }
                } catch (error) {
                    if (!(error instanceof NotFoundError)) {
                        logger.error(`Error handling ORDER_CANCELLED event: ${error.message}`);
                    }
                }
                break;
                
            default:
                break;
        }
    }
}

module.exports = PaymentService; 