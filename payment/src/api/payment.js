const express = require('express');
const { PAYMENT_SERVICE } = require('../config');
const PaymentService = require('../services/payment-service');
const InvoiceService = require('../services/invoice-service');
const ReportService = require('../services/report-service');
const { PublishMessage, SubscribeMessage } = require('../utils');
const validateToken = require('./middlewares/auth');
const { validateBody, validateParams } = require('./middlewares/validator');
const { paymentSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('payment-api');

module.exports = (app, channel) => {
    const router = express.Router();
    const paymentService = new PaymentService();
    const invoiceService = new InvoiceService();
    const reportService = new ReportService();

    // Subscribe to events if channel is available
    if (channel) {
        SubscribeMessage(channel, paymentService);
    }

    // Root route
    router.get('/', (req, res) => {
        res.json({
            message: 'Payment service API',
            version: '1.0.0'
        });
    });

    // Health check
    router.get('/health', async (req, res) => {
        res.status(200).json({
            service: 'Payment Service',
            status: 'active',
            time: new Date()
        });
    });

    // Payment routes
    router.post('/process', validateToken, validateBody(paymentSchema.process), async (req, res, next) => {
        try {
            const { orderId, amount, currency, paymentMethod, description } = req.body;
            const customerId = req.user.id;

            const payment = await paymentService.ProcessPayment({
                orderId,
                customerId,
                amount,
                currency,
                paymentMethod,
                description
            });

            // Publish payment completed event
            if (channel && payment.status === 'completed') {
                PublishMessage(channel, PAYMENT_SERVICE, {
                    event: 'PAYMENT_COMPLETED',
                    data: payment
                });
            }

            res.status(201).json(payment);
        } catch (err) {
            next(err);
        }
    });

    // Test endpoint for payment processing (REMOVE IN PRODUCTION)
    router.post('/test-process', validateBody(paymentSchema.process), async (req, res, next) => {
        try {
            const { orderId, amount, currency, paymentMethod, description } = req.body;
            const customerId = "test-customer-123"; // Use a test customer ID

            const payment = await paymentService.ProcessPayment({
                orderId,
                customerId,
                amount,
                currency,
                paymentMethod,
                description
            });

            // Publish payment completed event
            if (channel && payment.status === 'completed') {
                PublishMessage(channel, PAYMENT_SERVICE, {
                    event: 'PAYMENT_COMPLETED',
                    data: payment
                });
            }

            res.status(201).json(payment);
        } catch (err) {
            next(err);
        }
    });

    router.get('/status/:id', validateToken, validateParams(paymentSchema.params), async (req, res, next) => {
        try {
            const { id } = req.params;
            const payment = await paymentService.GetPaymentById(id);
            res.status(200).json(payment);
        } catch (err) {
            next(err);
        }
    });

    router.get('/customer/:customerId', validateToken, async (req, res, next) => {
        try {
            const { customerId } = req.params;
            
            // Ensure user can only access their own payments unless they're an admin
            if (req.user.id !== customerId && req.user.role !== 'admin') {
                throw new ValidationError('You can only access your own payments');
            }
            
            const payments = await paymentService.GetPaymentsByCustomerId(customerId);
            res.status(200).json(payments);
        } catch (err) {
            next(err);
        }
    });

    // Invoice routes
    router.post('/invoice', validateToken, validateBody(paymentSchema.invoice), async (req, res, next) => {
        try {
            const { paymentId, customerId, items } = req.body;
            
            // Ensure user can only create invoices for themselves unless they're an admin
            if (req.user.id !== customerId && req.user.role !== 'admin') {
                throw new ValidationError('You can only create invoices for yourself');
            }
            
            const invoice = await invoiceService.GenerateInvoice({
                paymentId,
                customerId,
                customerName: req.body.customerName || `${req.user.firstName} ${req.user.lastName}`,
                customerEmail: req.body.customerEmail || req.user.email,
                billingAddress: req.body.billingAddress,
                items,
                notes: req.body.notes
            });
            
            res.status(201).json(invoice);
        } catch (err) {
            next(err);
        }
    });

    router.get('/invoice/:id', validateToken, validateParams(paymentSchema.params), async (req, res, next) => {
        try {
            const { id } = req.params;
            const invoice = await invoiceService.GetInvoiceById(id);
            
            // Ensure user can only access their own invoices unless they're an admin
            if (req.user.id !== invoice.customerId && req.user.role !== 'admin') {
                throw new ValidationError('You can only access your own invoices');
            }
            
            res.status(200).json(invoice);
        } catch (err) {
            next(err);
        }
    });

    router.get('/invoice/download/:id', validateToken, validateParams(paymentSchema.params), async (req, res, next) => {
        try {
            const { id } = req.params;
            const invoice = await invoiceService.GetInvoiceById(id);
            
            // Ensure user can only access their own invoices unless they're an admin
            if (req.user.id !== invoice.customerId && req.user.role !== 'admin') {
                throw new ValidationError('You can only access your own invoices');
            }
            
            const pdfBuffer = await invoiceService.GenerateInvoicePDF(id);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
            res.send(pdfBuffer);
        } catch (err) {
            next(err);
        }
    });

    // Report routes
    router.post('/reports', validateToken, validateBody(paymentSchema.report), async (req, res, next) => {
        try {
            const { startDate, endDate, type } = req.body;
            
            // Only admins can generate reports
            if (req.user.role !== 'admin') {
                throw new ValidationError('Only administrators can generate reports');
            }
            
            const report = await reportService.GenerateReport({
                name: req.body.name || `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
                type,
                startDate,
                endDate,
                filters: req.body.filters || {},
                createdBy: req.user.id,
                format: req.body.format || 'json'
            });
            
            res.status(201).json(report);
        } catch (err) {
            next(err);
        }
    });

    router.get('/reports/:id', validateToken, validateParams(paymentSchema.params), async (req, res, next) => {
        try {
            const { id } = req.params;
            
            // Only admins can access reports
            if (req.user.role !== 'admin') {
                throw new ValidationError('Only administrators can access reports');
            }
            
            const report = await reportService.GetReportById(id);
            res.status(200).json(report);
        } catch (err) {
            next(err);
        }
    });

    router.get('/reports', validateToken, async (req, res, next) => {
        try {
            // Only admins can access reports
            if (req.user.role !== 'admin') {
                throw new ValidationError('Only administrators can access reports');
            }
            
            const reports = await reportService.GetReportsByCreator(req.user.id);
            res.status(200).json(reports);
        } catch (err) {
            next(err);
        }
    });

    return router;
}; 