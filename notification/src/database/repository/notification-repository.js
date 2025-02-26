const Notification = require('../models/Notification');
const { DatabaseError, NotFoundError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('notification-repository');

class NotificationRepository {
    async CreateNotification(notificationData) {
        try {
            const notification = new Notification(notificationData);
            const result = await notification.save();
            return result;
        } catch (err) {
            logger.error(`Error creating notification: ${err.message}`);
            throw new DatabaseError(`Error creating notification: ${err.message}`);
        }
    }

    async FindNotificationById(id) {
        try {
            const notification = await Notification.findById(id);
            
            if (!notification) {
                throw new NotFoundError(`Notification with ID ${id} not found`);
            }
            
            return notification;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error finding notification by ID: ${err.message}`);
            throw new DatabaseError(`Error finding notification: ${err.message}`);
        }
    }

    async FindNotificationsByUserId(userId, options = {}) {
        try {
            const { limit = 50, skip = 0, status, type } = options;
            
            const query = { userId };
            
            if (status) {
                query.status = status;
            }
            
            if (type) {
                query.type = type;
            }
            
            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
                
            return notifications;
        } catch (err) {
            logger.error(`Error finding notifications by user ID: ${err.message}`);
            throw new DatabaseError(`Error finding notifications: ${err.message}`);
        }
    }

    async UpdateNotification(id, updateData) {
        try {
            const notification = await Notification.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!notification) {
                throw new NotFoundError(`Notification with ID ${id} not found`);
            }
            
            return notification;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error updating notification: ${err.message}`);
            throw new DatabaseError(`Error updating notification: ${err.message}`);
        }
    }

    async MarkNotificationAsRead(id) {
        try {
            const notification = await Notification.findByIdAndUpdate(
                id,
                { 
                    status: 'read',
                    readAt: new Date()
                },
                { new: true }
            );
            
            if (!notification) {
                throw new NotFoundError(`Notification with ID ${id} not found`);
            }
            
            return notification;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error marking notification as read: ${err.message}`);
            throw new DatabaseError(`Error marking notification as read: ${err.message}`);
        }
    }

    async MarkAllNotificationsAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { 
                    userId,
                    status: { $ne: 'read' }
                },
                { 
                    status: 'read',
                    readAt: new Date()
                }
            );
            
            return { 
                success: true,
                modifiedCount: result.modifiedCount
            };
        } catch (err) {
            logger.error(`Error marking all notifications as read: ${err.message}`);
            throw new DatabaseError(`Error marking all notifications as read: ${err.message}`);
        }
    }

    async DeleteNotification(id) {
        try {
            const notification = await Notification.findByIdAndDelete(id);
            
            if (!notification) {
                throw new NotFoundError(`Notification with ID ${id} not found`);
            }
            
            return { success: true };
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error deleting notification: ${err.message}`);
            throw new DatabaseError(`Error deleting notification: ${err.message}`);
        }
    }

    async GetUnreadNotificationsCount(userId) {
        try {
            const count = await Notification.countDocuments({
                userId,
                status: { $ne: 'read' }
            });
            
            return { count };
        } catch (err) {
            logger.error(`Error getting unread notifications count: ${err.message}`);
            throw new DatabaseError(`Error getting unread notifications count: ${err.message}`);
        }
    }
}

module.exports = NotificationRepository; 