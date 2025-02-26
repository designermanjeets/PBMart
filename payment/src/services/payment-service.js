const { PaymentError, NotFoundError } = require('../utils/errors');
const PaymentRepository = require('../database/repository/payment-repository');
const { createLogger } = require('../utils/logger');
const logger = createLogger('payment-service');
const { STRIPE_SECRET_KEY } = require('../config');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

class PaymentService {
    constructor() {
        this.repository = new PaymentRepository();
    }

    async ProcessPayment(paymentInput) {
        try {
            const { orderId, customerId, amount, currency, paymentMethod, description } = paymentInput;
            
            // Check if payment already exists for this order
            try {
                const existingPayment = await this.repository.FindPaymentByOrderId(orderId);
                if (existingPayment) {
                    return existingPayment;
                }
            } catch (error) {
                // If payment not found, continue with creating a new one
                if (!(error instanceof NotFoundError)) {
                    throw error;
                }
            }
            
            // Process payment based on payment method
            let paymentResult;
            let status = 'pending';
            let transactionId = null;
            
            if (paymentMethod === 'credit_card') {
                // In a real application, you would integrate with Stripe or another payment processor
                // This is a simplified example
                try {
                    // Create a payment intent with Stripe
                    const paymentIntent = await stripe.paymentIntents.create({
                        amount: Math.round(amount * 100), // Stripe requires amount in cents
                        currency: currency.toLowerCase(),
                        description: description || `Payment for order ${orderId}`,
                        metadata: {
                            orderId,
                            customerId
                        }
                    });
                    
                    // In a real application, you would confirm the payment intent with the client
                    // For this example, we'll simulate a successful payment
                    status = 'completed';
                    transactionId = paymentIntent.id;
                } catch (stripeError) {
                    logger.error(`Stripe payment error: ${stripeError.message}`);
                    status = 'failed';
                    throw new PaymentError(`Credit card payment failed: ${stripeError.message}`);
                }
            } else if (paymentMethod === 'paypal') {
                // Simulate PayPal payment
                status = 'completed';
                transactionId = `pp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            } else if (paymentMethod === 'bank_transfer') {
                // Bank transfers are typically pending until confirmed
                status = 'pending';
                transactionId = `bt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            }
            
            // Create payment record
            const payment = await this.repository.CreatePayment({
                orderId,
                customerId,
                amount,
                currency,
                paymentMethod,
                status,
                transactionId,
                description: description || `Payment for order ${orderId}`
            });
            
            logger.info(`Payment processed: ${payment.id} for order ${orderId}`);
            return payment;
        } catch (err) {
            logger.error(`Error processing payment: ${err.message}`);
            throw err;
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