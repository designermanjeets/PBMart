const express = require('express');
const { NOTIFICATION_SERVICE } = require('../config');
const NotificationService = require('../services/notification-service');
const { PublishMessage, SubscribeMessage } = require('../utils');
const validateToken = require('./middlewares/auth');
const { validateBody, validateParams, validateQuery } = require('./middlewares/validator');
const { notificationSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('notification-api');

module.exports = (app, channel) => {
    const router = express.Router();
    const notificationService = new NotificationService();

    // Subscribe to events if channel is available
    if (channel) {
        SubscribeMessage(channel, notificationService);
    }

    // Root route
    router.get('/', (req, res) => {
        res.json({
            message: 'Notification service API',
            version: '1.0.0'
        });
    });

    // Health check
    router.get('/health', async (req, res) => {
        res.status(200).json({
            service: 'Notification Service',
            status: 'active',
            time: new Date()
        });
    });

    // Send email notification
    router.post('/email', validateToken, validateBody(notificationSchema.email), async (req, res, next) => {
        try {
            const { email, templateName, data, options } = req.body;
            
            const result = await notificationService.SendEmailNotification(
                req.user.id,
                email,
                templateName,
                data,
                options
            );
            
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    });

    // Send SMS notification
    router.post('/sms', validateToken, validateBody(notificationSchema.sms), async (req, res, next) => {
        try {
            const { phoneNumber, templateName, data, options } = req.body;
            
            const result = await notificationService.SendSMSNotification(
                req.user.id,
                phoneNumber,
                templateName,
                data,
                options
            );
            
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    });

    // Send in-app notification
    router.post('/inapp', validateToken, validateBody(notificationSchema.inapp), async (req, res, next) => {
        try {
            const { templateName, data } = req.body;
            
            const result = await notificationService.SendInAppNotification(
                req.user.id,
                templateName,
                data
            );
            
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    });

    // Get user notifications
    router.get('/user', validateToken, validateQuery(notificationSchema.query), async (req, res, next) => {
        try {
            const notifications = await notificationService.GetUserNotifications(req.user.id, req.query);
            res.status(200).json(notifications);
        } catch (err) {
            next(err);
        }
    });

    // Get notification by ID
    router.get('/:id', validateToken, validateParams(notificationSchema.params), async (req, res, next) => {
        try {
            const notification = await notificationService.GetNotificationById(req.params.id);
            
            // Check if the notification belongs to the requesting user
            if (notification.userId !== req.user.id && req.user.role !== 'admin') {
                throw new ValidationError('You do not have permission to access this notification');
            }
            
            res.status(200).json(notification);
        } catch (err) {
            next(err);
        }
    });

    // Mark notification as read
    router.patch('/:id/read', validateToken, validateParams(notificationSchema.params), async (req, res, next) => {
        try {
            // First get the notification to check ownership
            const notification = await notificationService.GetNotificationById(req.params.id);
            
            // Check if the notification belongs to the requesting user
            if (notification.userId !== req.user.id && req.user.role !== 'admin') {
                throw new ValidationError('You do not have permission to modify this notification');
            }
            
            const result = await notificationService.MarkNotificationAsRead(req.params.id);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    });

    // Mark all notifications as read
    router.patch('/user/read-all', validateToken, async (req, res, next) => {
        try {
            const result = await notificationService.MarkAllNotificationsAsRead(req.user.id);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    });

    // Get unread notifications count
    router.get('/user/unread-count', validateToken, async (req, res, next) => {
        try {
            const result = await notificationService.GetUnreadNotificationsCount(req.user.id);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    });

    return router;
}; 