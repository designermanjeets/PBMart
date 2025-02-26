const { NotFoundError } = require('../utils/errors');
const InvoiceRepository = require('../database/repository/invoice-repository');
const PaymentRepository = require('../database/repository/payment-repository');
const { createLogger } = require('../utils/logger');
const logger = createLogger('invoice-service');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceService {
    constructor() {
        this.repository = new InvoiceRepository();
        this.paymentRepository = new PaymentRepository();
    }

    async GenerateInvoice(invoiceInput) {
        try {
            const { paymentId, customerId, customerName, customerEmail, billingAddress, items, notes } = invoiceInput;
            
            // Verify payment exists and is completed
            const payment = await this.paymentRepository.FindPaymentById(paymentId);
            
            if (payment.status !== 'completed') {
                throw new Error('Cannot generate invoice for incomplete payment');
            }
            
            // Calculate totals
            let subtotal = 0;
            let totalTax = 0;
            
            items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                if (item.tax) {
                    totalTax += (itemTotal * item.tax) / 100;
                }
            });
            
            const total = subtotal + totalTax - (invoiceInput.discount || 0);
            
            // Generate invoice number
            const invoiceNumber = await this.repository.GenerateInvoiceNumber();
            
            // Set due date (30 days from now by default)
            const dueDate = invoiceInput.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            // Create invoice
            const invoice = await this.repository.CreateInvoice({
                invoiceNumber,
                paymentId,
                customerId,
                customerName,
                customerEmail,
                billingAddress,
                items,
                subtotal,
                tax: totalTax,
                discount: invoiceInput.discount || 0,
                total,
                notes,
                dueDate,
                status: 'sent'
            });
            
            // Generate PDF
            const pdfBuffer = await this.GenerateInvoicePDF(invoice.id);
            
            // In a real application, you would save this PDF to a storage service
            // and update the invoice with the URL
            const pdfDir = path.join(__dirname, '../../public/invoices');
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(pdfDir)) {
                fs.mkdirSync(pdfDir, { recursive: true });
            }
            
            const pdfPath = path.join(pdfDir, `invoice-${invoiceNumber}.pdf`);
            fs.writeFileSync(pdfPath, pdfBuffer);
            
            // Update invoice with PDF URL
            const pdfUrl = `/invoices/invoice-${invoiceNumber}.pdf`;
            await this.repository.UpdateInvoice(invoice.id, { pdfUrl });
            
            logger.info(`Invoice generated: ${invoice.id} for payment ${paymentId}`);
            return { ...invoice.toJSON(), pdfUrl };
        } catch (err) {
            logger.error(`Error generating invoice: ${err.message}`);
            throw err;
        }
    }

    async GetInvoiceById(id) {
        try {
            return await this.repository.FindInvoiceById(id);
        } catch (err) {
            logger.error(`Error getting invoice by ID: ${err.message}`);
            throw err;
        }
    }

    async GetInvoiceByNumber(invoiceNumber) {
        try {
            return await this.repository.FindInvoiceByNumber(invoiceNumber);
        } catch (err) {
            logger.error(`Error getting invoice by number: ${err.message}`);
            throw err;
        }
    }

    async GetInvoicesByCustomerId(customerId) {
        try {
            return await this.repository.FindInvoicesByCustomerId(customerId);
        } catch (err) {
            logger.error(`Error getting invoices by customer ID: ${err.message}`);
            throw err;
        }
    }

    async UpdateInvoiceStatus(id, status) {
        try {
            return await this.repository.UpdateInvoice(id, { status });
        } catch (err) {
            logger.error(`Error updating invoice status: ${err.message}`);
            throw err;
        }
    }

    async GenerateInvoicePDF(invoiceId) {
        try {
            const invoice = await this.repository.FindInvoiceById(invoiceId);
            const payment = await this.paymentRepository.FindPaymentById(invoice.paymentId);
            
            // Create a new PDF document
            const doc = new PDFDocument({ margin: 50 });
            
            // Buffer to store PDF
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            
            // Add content to PDF
            this._generatePDFContent(doc, invoice, payment);
            
            // Finalize the PDF
            doc.end();
            
            // Return promise that resolves with PDF buffer
            return new Promise((resolve) => {
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });
            });
        } catch (err) {
            logger.error(`Error generating invoice PDF: ${err.message}`);
            throw err;
        }
    }

    _generatePDFContent(doc, invoice, payment) {
        // Add company logo and header
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();
        
        // Add invoice details
        doc.fontSize(12);
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
        doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`);
        doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`);
        doc.moveDown();
        
        // Add customer details
        doc.text('Bill To:');
        doc.text(invoice.customerName);
        doc.text(invoice.customerEmail);
        
        if (invoice.billingAddress) {
            const address = invoice.billingAddress;
            doc.text([
                address.street,
                `${address.city}, ${address.state} ${address.postalCode}`,
                address.country
            ].filter(Boolean).join('\n'));
        }
        
        doc.moveDown();
        
        // Add payment details
        doc.text(`Payment Method: ${payment.paymentMethod.replace('_', ' ').toUpperCase()}`);
        doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
        doc.moveDown();
        
        // Add items table
        const tableTop = doc.y;
        const itemX = 50;
        const descriptionX = 150;
        const quantityX = 300;
        const priceX = 350;
        const totalX = 450;
        
        // Table headers
        doc.font('Helvetica-Bold')
            .text('Item', itemX, tableTop)
            .text('Description', descriptionX, tableTop)
            .text('Qty', quantityX, tableTop)
            .text('Price', priceX, tableTop)
            .text('Total', totalX, tableTop);
        
        // Draw header line
        doc.moveTo(itemX, tableTop + 20)
            .lineTo(totalX + 50, tableTop + 20)
            .stroke();
        
        // Reset font
        doc.font('Helvetica');
        
        // Table rows
        let y = tableTop + 30;
        invoice.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            doc.text(item.name, itemX, y)
                .text(item.description || '', descriptionX, y)
                .text(item.quantity.toString(), quantityX, y)
                .text(`$${item.price.toFixed(2)}`, priceX, y)
                .text(`$${itemTotal.toFixed(2)}`, totalX, y);
            
            y += 20;
        });
        
        // Draw bottom line
        doc.moveTo(itemX, y)
            .lineTo(totalX + 50, y)
            .stroke();
        
        y += 20;
        
        // Add totals
        doc.text('Subtotal:', 350, y);
        doc.text(`$${invoice.subtotal.toFixed(2)}`, totalX, y);
        y += 20;
        
        if (invoice.tax > 0) {
            doc.text('Tax:', 350, y);
            doc.text(`$${invoice.tax.toFixed(2)}`, totalX, y);
            y += 20;
        }
        
        if (invoice.discount > 0) {
            doc.text('Discount:', 350, y);
            doc.text(`$${invoice.discount.toFixed(2)}`, totalX, y);
            y += 20;
        }
        
        // Draw total line
        doc.moveTo(350, y)
            .lineTo(totalX + 50, y)
            .stroke();
        
        y += 10;
        
        // Add total
        doc.font('Helvetica-Bold')
            .text('TOTAL:', 350, y)
            .text(`$${invoice.total.toFixed(2)}`, totalX, y);
        
        // Add notes if any
        if (invoice.notes) {
            doc.moveDown(2);
            doc.font('Helvetica-Bold').text('Notes:');
            doc.font('Helvetica').text(invoice.notes);
        }
        
        // Add footer
        const pageHeight = doc.page.height;
        doc.font('Helvetica')
            .fontSize(10)
            .text(
                'Thank you for your business!',
                50,
                pageHeight - 50,
                { align: 'center' }
            );
    }
}

module.exports = InvoiceService; 