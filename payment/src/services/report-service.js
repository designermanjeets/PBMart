const ReportRepository = require('../database/repository/report-repository');
const PaymentRepository = require('../database/repository/payment-repository');
const InvoiceRepository = require('../database/repository/invoice-repository');
const { createLogger } = require('../utils/logger');
const logger = createLogger('report-service');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

class ReportService {
    constructor() {
        this.repository = new ReportRepository();
        this.paymentRepository = new PaymentRepository();
        this.invoiceRepository = new InvoiceRepository();
    }

    async GenerateReport(reportInput) {
        try {
            const { name, type, startDate, endDate, filters, createdBy, format } = reportInput;
            
            // Generate report data based on type
            let data;
            
            switch (type) {
                case 'sales':
                    data = await this._generateSalesReport(startDate, endDate, filters);
                    break;
                case 'revenue':
                    data = await this._generateRevenueReport(startDate, endDate, filters);
                    break;
                case 'transactions':
                    data = await this._generateTransactionsReport(startDate, endDate, filters);
                    break;
                default:
                    throw new Error(`Unsupported report type: ${type}`);
            }
            
            // Create report record
            const report = await this.repository.CreateReport({
                name,
                type,
                startDate,
                endDate,
                data,
                filters,
                createdBy,
                format
            });
            
            // Generate file if format is not JSON
            if (format !== 'json') {
                const reportDir = path.join(__dirname, '../../public/reports');
                
                // Create directory if it doesn't exist
                if (!fs.existsSync(reportDir)) {
                    fs.mkdirSync(reportDir, { recursive: true });
                }
                
                const fileName = `report-${report.id}-${Date.now()}`;
                let fileUrl;
                
                if (format === 'pdf') {
                    const pdfPath = path.join(reportDir, `${fileName}.pdf`);
                    await this._generatePDFReport(report, pdfPath);
                    fileUrl = `/reports/${fileName}.pdf`;
                } else if (format === 'csv') {
                    const csvPath = path.join(reportDir, `${fileName}.csv`);
                    await this._generateCSVReport(report, csvPath);
                    fileUrl = `/reports/${fileName}.csv`;
                }
                
                // Update report with file URL
                if (fileUrl) {
                    await this.repository.UpdateReport(report.id, { fileUrl });
                    report.fileUrl = fileUrl;
                }
            }
            
            logger.info(`Report generated: ${report.id} of type ${type}`);
            return report;
        } catch (err) {
            logger.error(`Error generating report: ${err.message}`);
            throw err;
        }
    }

    async GetReportById(id) {
        try {
            return await this.repository.FindReportById(id);
        } catch (err) {
            logger.error(`Error getting report by ID: ${err.message}`);
            throw err;
        }
    }

    async GetReportsByCreator(createdBy) {
        try {
            return await this.repository.FindReportsByCreator(createdBy);
        } catch (err) {
            logger.error(`Error getting reports by creator: ${err.message}`);
            throw err;
        }
    }

    async _generateSalesReport(startDate, endDate, filters) {
        // Get invoice stats
        const invoiceStats = await this.invoiceRepository.GetInvoiceStats(startDate, endDate);
        
        // Calculate total sales
        const totalInvoices = invoiceStats.reduce((sum, day) => sum + day.count, 0);
        const totalSales = invoiceStats.reduce((sum, day) => sum + day.totalAmount, 0);
        
        // Format data for report
        return {
            summary: {
                totalInvoices,
                totalSales,
                averageInvoiceValue: totalInvoices > 0 ? totalSales / totalInvoices : 0
            },
            dailyStats: invoiceStats.map(day => ({
                date: day._id,
                invoices: day.count,
                sales: day.totalAmount,
                averageValue: day.avgAmount
            }))
        };
    }

    async _generateRevenueReport(startDate, endDate, filters) {
        // Get payment stats
        const paymentStats = await this.paymentRepository.GetPaymentStats(startDate, endDate);
        
        // Calculate total revenue
        const totalTransactions = paymentStats.reduce((sum, day) => sum + day.count, 0);
        const totalRevenue = paymentStats.reduce((sum, day) => sum + day.totalAmount, 0);
        
        // Format data for report
        return {
            summary: {
                totalTransactions,
                totalRevenue,
                averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
            },
            dailyStats: paymentStats.map(day => ({
                date: day._id,
                transactions: day.count,
                revenue: day.totalAmount,
                averageValue: day.avgAmount
            }))
        };
    }

    async _generateTransactionsReport(startDate, endDate, filters) {
        // Get payment stats by payment method
        const payments = await this.paymentRepository.FindPaymentsByDateRange(startDate, endDate);
        
        // Group by payment method
        const methodStats = {};
        payments.forEach(payment => {
            const method = payment.paymentMethod;
            if (!methodStats[method]) {
                methodStats[method] = {
                    count: 0,
                    amount: 0
                };
            }
            methodStats[method].count += 1;
            methodStats[method].amount += payment.amount;
        });
        
        // Calculate totals
        const totalTransactions = payments.length;
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Format data for report
        return {
            summary: {
                totalTransactions,
                totalAmount,
                averageTransactionValue: totalTransactions > 0 ? totalAmount / totalTransactions : 0
            },
            paymentMethods: Object.keys(methodStats).map(method => ({
                method,
                count: methodStats[method].count,
                amount: methodStats[method].amount,
                percentage: (methodStats[method].count / totalTransactions) * 100
            })),
            statusBreakdown: {
                completed: payments.filter(p => p.status === 'completed').length,
                pending: payments.filter(p => p.status === 'pending').length,
                failed: payments.filter(p => p.status === 'failed').length,
                refunded: payments.filter(p => p.status === 'refunded').length
            }
        };
    }

    async _generatePDFReport(report, filePath) {
        // Create a new PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Pipe output to file
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        
        // Add content to PDF
        doc.fontSize(20).text(report.name, { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text(`Report Type: ${report.type.toUpperCase()}`);
        doc.text(`Date Range: ${new Date(report.startDate).toLocaleDateString()} to ${new Date(report.endDate).toLocaleDateString()}`);
        doc.text(`Generated On: ${new Date(report.createdAt).toLocaleString()}`);
        doc.moveDown();
        
        // Add summary section
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown();
        
        const summary = report.data.summary;
        Object.keys(summary).forEach(key => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            let value = summary[key];
            
            // Format currency values
            if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('sales') || key.toLowerCase().includes('value')) {
                value = `$${value.toFixed(2)}`;
            } else if (typeof value === 'number') {
                value = value.toFixed(2);
            }
            
            doc.fontSize(12).text(`${formattedKey}: ${value}`);
        });
        
        doc.moveDown();
        
        // Add detailed data based on report type
        if (report.type === 'sales' || report.type === 'revenue') {
            doc.fontSize(16).text('Daily Breakdown', { underline: true });
            doc.moveDown();
            
            const tableTop = doc.y;
            const dateX = 50;
            const countX = 200;
            const amountX = 300;
            const avgX = 400;
            
            // Table headers
            doc.font('Helvetica-Bold')
                .text('Date', dateX, tableTop)
                .text(report.type === 'sales' ? 'Invoices' : 'Transactions', countX, tableTop)
                .text(report.type === 'sales' ? 'Sales' : 'Revenue', amountX, tableTop)
                .text('Avg Value', avgX, tableTop);
            
            // Draw header line
            doc.moveTo(dateX, tableTop + 20)
                .lineTo(avgX + 100, tableTop + 20)
                .stroke();
            
            // Reset font
            doc.font('Helvetica');
            
            // Table rows
            let y = tableTop + 30;
            report.data.dailyStats.forEach(day => {
                doc.text(day.date, dateX, y)
                    .text(day.invoices || day.transactions, countX, y)
                    .text(`$${(day.sales || day.revenue).toFixed(2)}`, amountX, y)
                    .text(`$${day.averageValue.toFixed(2)}`, avgX, y);
                
                y += 20;
            });
        } else if (report.type === 'transactions') {
            // Payment methods breakdown
            doc.fontSize(16).text('Payment Methods', { underline: true });
            doc.moveDown();
            
            const tableTop = doc.y;
            const methodX = 50;
            const countX = 200;
            const amountX = 300;
            const percentX = 400;
            
            // Table headers
            doc.font('Helvetica-Bold')
                .text('Method', methodX, tableTop)
                .text('Count', countX, tableTop)
                .text('Amount', amountX, tableTop)
                .text('Percentage', percentX, tableTop);
            
            // Draw header line
            doc.moveTo(methodX, tableTop + 20)
                .lineTo(percentX + 100, tableTop + 20)
                .stroke();
            
            // Reset font
            doc.font('Helvetica');
            
            // Table rows
            let y = tableTop + 30;
            report.data.paymentMethods.forEach(method => {
                doc.text(method.method.replace('_', ' ').toUpperCase(), methodX, y)
                    .text(method.count.toString(), countX, y)
                    .text(`$${method.amount.toFixed(2)}`, amountX, y)
                    .text(`${method.percentage.toFixed(2)}%`, percentX, y);
                
                y += 20;
            });
            
            doc.moveDown(2);
            
            // Status breakdown
            doc.fontSize(16).text('Status Breakdown', { underline: true });
            doc.moveDown();
            
            const status = report.data.statusBreakdown;
            doc.text(`Completed: ${status.completed}`);
            doc.text(`Pending: ${status.pending}`);
            doc.text(`Failed: ${status.failed}`);
            doc.text(`Refunded: ${status.refunded}`);
        }
        
        // Add footer
        const pageHeight = doc.page.height;
        doc.font('Helvetica')
            .fontSize(10)
            .text(
                'Confidential - For internal use only',
                50,
                pageHeight - 50,
                { align: 'center' }
            );
        
        // Finalize the PDF
        doc.end();
        
        // Return promise that resolves when the file is written
        return new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }

    async _generateCSVReport(report, filePath) {
        let csvContent = '';
        
        // Add report header
        csvContent += `"${report.name}"\n`;
        csvContent += `"Report Type","${report.type}"\n`;
        csvContent += `"Date Range","${new Date(report.startDate).toLocaleDateString()} to ${new Date(report.endDate).toLocaleDateString()}"\n`;
        csvContent += `"Generated On","${new Date(report.createdAt).toLocaleString()}"\n\n`;
        
        // Add summary section
        csvContent += '"Summary"\n';
        const summary = report.data.summary;
        Object.keys(summary).forEach(key => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            let value = summary[key];
            
            // Format currency values
            if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('sales') || key.toLowerCase().includes('value')) {
                value = `$${value.toFixed(2)}`;
            } else if (typeof value === 'number') {
                value = value.toFixed(2);
            }
            
            csvContent += `"${formattedKey}","${value}"\n`;
        });
        
        csvContent += '\n';
        
        // Add detailed data based on report type
        if (report.type === 'sales' || report.type === 'revenue') {
            csvContent += '"Daily Breakdown"\n';
            
            // Table headers
            csvContent += `"Date","${report.type === 'sales' ? 'Invoices' : 'Transactions'}","${report.type === 'sales' ? 'Sales' : 'Revenue'}","Avg Value"\n`;
            
            // Table rows
            report.data.dailyStats.forEach(day => {
                csvContent += `"${day.date}","${day.invoices || day.transactions}","$${(day.sales || day.revenue).toFixed(2)}","$${day.averageValue.toFixed(2)}"\n`;
            });
        } else if (report.type === 'transactions') {
            // Payment methods breakdown
            csvContent += '"Payment Methods"\n';
            
            // Table headers
            csvContent += '"Method","Count","Amount","Percentage"\n';
            
            // Table rows
            report.data.paymentMethods.forEach(method => {
                csvContent += `"${method.method.replace('_', ' ').toUpperCase()}","${method.count}","$${method.amount.toFixed(2)}","${method.percentage.toFixed(2)}%"\n`;
            });
            
            csvContent += '\n';
            
            // Status breakdown
            csvContent += '"Status Breakdown"\n';
            
            const status = report.data.statusBreakdown;
            csvContent += `"Completed","${status.completed}"\n`;
            csvContent += `"Pending","${status.pending}"\n`;
            csvContent += `"Failed","${status.failed}"\n`;
            csvContent += `"Refunded","${status.refunded}"\n`;
        }
        
        // Write to file
        fs.writeFileSync(filePath, csvContent);
    }
}

module.exports = ReportService; 