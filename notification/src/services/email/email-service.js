const nodemailer = require('nodemailer');
const { 
    EMAIL_SERVICE, 
    EMAIL_HOST, 
    EMAIL_PORT, 
    EMAIL_USER, 
    EMAIL_PASSWORD, 
    EMAIL_FROM 
} = require('../../config');
const { NotificationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('email-service');

class EmailService {
    constructor() {
        // Create a test account at Ethereal Email
        nodemailer.createTestAccount().then(testAccount => {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            logger.info(`Test email account created: ${testAccount.user}`);
        }).catch(err => {
            logger.error(`Error creating test email account: ${err.message}`);
            // Fallback to regular configuration
            this.transporter = nodemailer.createTransport({
                service: EMAIL_SERVICE,
                host: EMAIL_HOST,
                port: EMAIL_PORT,
                secure: EMAIL_PORT === 465,
                auth: {
                    user: EMAIL_USER,
                    pass: EMAIL_PASSWORD
                }
            });
        });
    }

    async sendEmail(to, subject, html, options = {}) {
        try {
            const { cc, bcc, attachments } = options;
            
            // For testing: just log the email instead of sending
            logger.info(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
            logger.info(`[MOCK EMAIL] HTML: ${html}`);
            
            // Return a mock success response
            return {
                success: true,
                messageId: `mock-email-${Date.now()}`
            };
            
            /* Comment out the actual email sending code for now
            const mailOptions = {
                from: options.from || EMAIL_FROM,
                to,
                subject,
                html,
                ...(cc && { cc }),
                ...(bcc && { bcc }),
                ...(attachments && { attachments })
            };
            
            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent: ${info.messageId}`);
            
            return {
                success: true,
                messageId: info.messageId
            };
            */
        } catch (error) {
            logger.error(`Error sending email: ${error.message}`);
            throw new NotificationError(`Failed to send email: ${error.message}`);
        }
    }

    async renderTemplate(template, data) {
        try {
            // Simple template rendering with variable replacement
            let renderedContent = template.content;
            
            // Replace variables in the template
            for (const key in data) {
                const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                renderedContent = renderedContent.replace(regex, data[key]);
            }
            
            // Replace subject variables if it's an email template
            let renderedSubject = template.subject || '';
            if (template.subject) {
                for (const key in data) {
                    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                    renderedSubject = renderedSubject.replace(regex, data[key]);
                }
            }
            
            return {
                subject: renderedSubject,
                content: renderedContent
            };
        } catch (error) {
            logger.error(`Error rendering template: ${error.message}`);
            throw new NotificationError(`Failed to render template: ${error.message}`);
        }
    }
}

module.exports = EmailService; 