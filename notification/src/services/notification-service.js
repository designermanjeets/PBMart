const NotificationRepository = require('../database/repository/notification-repository');
const TemplateRepository = require('../database/repository/template-repository');
const EmailService = require('./email/email-service');
const SMSService = require('./sms/sms-service');
const InAppService = require('./inapp/inapp-service');
const { NotFoundError, NotificationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('notification-service');

class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository();
        this.templateRepository = new TemplateRepository();
        this.emailService = new EmailService();
        this.smsService = new SMSService();
        this.inAppService = new InAppService();
    }

    async SendEmailNotification(userId, email, templateName, data, options = {}) {
        try {
            // Find template
            const template = await this.templateRepository.FindTemplateByName(templateName);
            
            if (template.type !== 'email') {
                throw new NotificationError(`Template ${templateName} is not an email template`);
            }
            
            // Render template
            const rendered = await this.emailService.renderTemplate(template, data);
            
            // Create notification record
            const notification = await this.notificationRepository.CreateNotification({
                userId,
                type: 'email',
                title: rendered.subject,
                content: rendered.content,
                metadata: {
                    email,
                    templateName,
                    data
                }
            });
            
            // Send email
            const result = await this.emailService.sendEmail(
                email,
                rendered.subject,
                rendered.content,
                options
            );
            
            // Update notification status
            await this.notificationRepository.UpdateNotification(notification.id, {
                status: 'sent',
                sentAt: new Date(),
                metadata: {
                    ...notification.metadata,
                    messageId: result.messageId
                }
            });
            
            return {
                success: true,
                notificationId: notification.id,
                messageId: result.messageId
            };
        } catch (error) {
            logger.error(`Error sending email notification: ${error.message}`);
            
            // If notification was created but sending failed, update its status
            if (error.notificationId) {
                await this.notificationRepository.UpdateNotification(error.notificationId, {
                    status: 'failed',
                    metadata: {
                        ...error.notification.metadata,
                        error: error.message
                    }
                });
            }
            
            throw new NotificationError(`Failed to send email notification: ${error.message}`);
        }
    }

    async SendSMSNotification(userId, phoneNumber, templateName, data, options = {}) {
        try {
            // Find template
            const template = await this.templateRepository.FindTemplateByName(templateName);
            
            if (template.type !== 'sms') {
                throw new NotificationError(`Template ${templateName} is not an SMS template`);
            }
            
            // Render template
            const rendered = await this.smsService.renderTemplate(template, data);
            
            // Create notification record
            const notification = await this.notificationRepository.CreateNotification({
                userId,
                type: 'sms',
                title: templateName,
                content: rendered.content,
                metadata: {
                    phoneNumber,
                    templateName,
                    data
                }
            });
            
            // Send SMS
            const result = await this.smsService.sendSMS(
                phoneNumber,
                rendered.content,
                options
            );
            
            // Update notification status
            await this.notificationRepository.UpdateNotification(notification.id, {
                status: 'sent',
                sentAt: new Date(),
                metadata: {
                    ...notification.metadata,
                    messageId: result.messageId
                }
            });
            
            return {
                success: true,
                notificationId: notification.id,
                messageId: result.messageId
            };
        } catch (error) {
            logger.error(`Error sending SMS notification: ${error.message}`);
            
            // If notification was created but sending failed, update its status
            if (error.notificationId) {
                await this.notificationRepository.UpdateNotification(error.notificationId, {
                    status: 'failed',
                    metadata: {
                        ...error.notification.metadata,
                        error: error.message
                    }
                });
            }
            
            throw new NotificationError(`Failed to send SMS notification: ${error.message}`);
        }
    }

    async SendInAppNotification(userId, templateName, data) {
        try {
            // Find template
            const template = await this.templateRepository.FindTemplateByName(templateName);
            
            if (template.type !== 'inapp') {
                throw new NotificationError(`Template ${templateName} is not an in-app template`);
            }
            
            // Render template
            const rendered = await this.inAppService.renderTemplate(template, data);
            
            // Create notification record
            const notification = await this.notificationRepository.CreateNotification({
                userId,
                type: 'inapp',
                title: data.title || templateName,
                content: rendered.content,
                metadata: {
                    templateName,
                    data
                }
            });
            
            // Send in-app notification
            await this.inAppService.sendNotification(userId, {
                id: notification.id,
                title: data.title || templateName,
                content: rendered.content,
                createdAt: notification.createdAt
            });
            
            // Update notification status
            await this.notificationRepository.UpdateNotification(notification.id, {
                status: 'sent',
                sentAt: new Date()
            });
            
            return {
                success: true,
                notificationId: notification.id
            };
        } catch (error) {
            logger.error(`Error sending in-app notification: ${error.message}`);
            
            // If notification was created but sending failed, update its status
            if (error.notificationId) {
                await this.notificationRepository.UpdateNotification(error.notificationId, {
                    status: 'failed',
                    metadata: {
                        ...error.notification.metadata,
                        error: error.message
                    }
                });
            }
            
            throw new NotificationError(`Failed to send in-app notification: ${error.message}`);
        }
    }

    async GetUserNotifications(userId, options = {}) {
        try {
            return await this.notificationRepository.FindNotificationsByUserId(userId, options);
        } catch (error) {
            logger.error(`Error getting user notifications: ${error.message}`);
            throw error;
        }
    }

    async GetNotificationById(id) {
        try {
            return await this.notificationRepository.FindNotificationById(id);
        } catch (error) {
            logger.error(`Error getting notification by ID: ${error.message}`);
            throw error;
        }
    }

    async MarkNotificationAsRead(id) {
        try {
            return await this.notificationRepository.MarkNotificationAsRead(id);
        } catch (error) {
            logger.error(`Error marking notification as read: ${error.message}`);
            throw error;
        }
    }

    async MarkAllNotificationsAsRead(userId) {
        try {
            return await this.notificationRepository.MarkAllNotificationsAsRead(userId);
        } catch (error) {
            logger.error(`Error marking all notifications as read: ${error.message}`);
            throw error;
        }
    }

    async GetUnreadNotificationsCount(userId) {
        try {
            return await this.notificationRepository.GetUnreadNotificationsCount(userId);
        } catch (error) {
            logger.error(`Error getting unread notifications count: ${error.message}`);
            throw error;
        }
    }

    // Handle events from other services
    async SubscribeEvents(payload) {
        const { event, data } = payload;
        
        logger.info(`Received event: ${event}`);
        
        try {
            switch (event) {
                case 'ORDER_CREATED':
                    await this.handleOrderCreated(data);
                    break;
                    
                case 'ORDER_CANCELLED':
                    await this.handleOrderCancelled(data);
                    break;
                    
                case 'PAYMENT_COMPLETED':
                    await this.handlePaymentCompleted(data);
                    break;
                    
                case 'USER_REGISTERED':
                    await this.handleUserRegistered(data);
                    break;
                    
                default:
                    logger.info(`No handler for event: ${event}`);
                    break;
            }
        } catch (error) {
            logger.error(`Error handling event ${event}: ${error.message}`);
        }
    }

    async handleOrderCreated(data) {
        try {
            const { orderId, userId, customerEmail, items, total } = data;
            
            // Send email notification
            await this.SendEmailNotification(
                userId,
                customerEmail,
                'order_confirmation',
                {
                    orderId,
                    customerName: data.customerName,
                    items: items.map(item => `${item.name} x ${item.quantity}`).join(', '),
                    total: `$${total.toFixed(2)}`,
                    orderDate: new Date().toLocaleDateString()
                }
            );
            
            // Send in-app notification
            await this.SendInAppNotification(
                userId,
                'order_confirmation_inapp',
                {
                    title: 'Order Confirmation',
                    orderId,
                    total: `$${total.toFixed(2)}`
                }
            );
            
            logger.info(`Order created notifications sent for order ${orderId}`);
        } catch (error) {
            logger.error(`Error handling order created event: ${error.message}`);
            throw error;
        }
    }

    async handleOrderCancelled(data) {
        try {
            const { orderId, userId, customerEmail } = data;
            
            // Send email notification
            await this.SendEmailNotification(
                userId,
                customerEmail,
                'order_cancelled',
                {
                    orderId,
                    customerName: data.customerName,
                    cancellationDate: new Date().toLocaleDateString(),
                    reason: data.reason || 'Customer request'
                }
            );
            
            // Send in-app notification
            await this.SendInAppNotification(
                userId,
                'order_cancelled_inapp',
                {
                    title: 'Order Cancelled',
                    orderId
                }
            );
            
            logger.info(`Order cancelled notifications sent for order ${orderId}`);
        } catch (error) {
            logger.error(`Error handling order cancelled event: ${error.message}`);
            throw error;
        }
    }

    async handlePaymentCompleted(data) {
        try {
            const { paymentId, orderId, userId, customerEmail, amount } = data;
            
            // Send email notification
            await this.SendEmailNotification(
                userId,
                customerEmail,
                'payment_confirmation',
                {
                    paymentId,
                    orderId,
                    customerName: data.customerName,
                    amount: `$${amount.toFixed(2)}`,
                    paymentDate: new Date().toLocaleDateString(),
                    paymentMethod: data.paymentMethod
                }
            );
            
            // Send in-app notification
            await this.SendInAppNotification(
                userId,
                'payment_confirmation_inapp',
                {
                    title: 'Payment Confirmation',
                    orderId,
                    amount: `$${amount.toFixed(2)}`
                }
            );
            
            logger.info(`Payment completed notifications sent for payment ${paymentId}`);
        } catch (error) {
            logger.error(`Error handling payment completed event: ${error.message}`);
            throw error;
        }
    }

    async handleUserRegistered(data) {
        try {
            const { userId, email, name } = data;
            
            // Send welcome email
            await this.SendEmailNotification(
                userId,
                email,
                'welcome_email',
                {
                    name,
                    registrationDate: new Date().toLocaleDateString()
                }
            );
            
            logger.info(`Welcome email sent to new user ${userId}`);
        } catch (error) {
            logger.error(`Error handling user registered event: ${error.message}`);
            throw error;
        }
    }
}

module.exports = NotificationService; 