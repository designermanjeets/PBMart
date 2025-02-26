const twilio = require('twilio');
const { 
    TWILIO_ACCOUNT_SID, 
    TWILIO_AUTH_TOKEN, 
    TWILIO_PHONE_NUMBER 
} = require('../../config');
const { NotificationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('sms-service');

class SMSService {
    constructor() {
        try {
            if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_ACCOUNT_SID.startsWith('AC')) {
                this.client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
                this.phoneNumber = TWILIO_PHONE_NUMBER;
                logger.info('Twilio client initialized successfully');
            } else {
                logger.warn('Valid Twilio credentials not provided. SMS service will not be functional.');
                this.client = null;
            }
        } catch (error) {
            logger.error(`Error initializing Twilio client: ${error.message}`);
            this.client = null;
        }
    }

    async sendSMS(to, body, options = {}) {
        try {
            if (!this.client) {
                logger.warn('SMS service is not configured. Message not sent.');
                return {
                    success: false,
                    message: 'SMS service is not configured'
                };
            }
            
            const message = await this.client.messages.create({
                body,
                from: options.from || this.phoneNumber,
                to
            });
            
            logger.info(`SMS sent: ${message.sid}`);
            
            return {
                success: true,
                messageId: message.sid
            };
        } catch (error) {
            logger.error(`Error sending SMS: ${error.message}`);
            throw new NotificationError(`Failed to send SMS: ${error.message}`);
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
            
            return {
                content: renderedContent
            };
        } catch (error) {
            logger.error(`Error rendering template: ${error.message}`);
            throw new NotificationError(`Failed to render template: ${error.message}`);
        }
    }
}

module.exports = SMSService; 