const { Server } = require('socket.io');
const { SOCKET_IO_PORT } = require('../../config');
const { NotificationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('inapp-service');

class InAppService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }

    initialize(server) {
        try {
            this.io = new Server(server, {
                cors: {
                    origin: '*', // In production, restrict this to your frontend domains
                    methods: ['GET', 'POST']
                }
            });
            
            this.io.on('connection', (socket) => {
                logger.info(`Socket connected: ${socket.id}`);
                
                // Handle user authentication
                socket.on('authenticate', (userId) => {
                    if (userId) {
                        this.connectedUsers.set(userId, socket.id);
                        socket.userId = userId;
                        logger.info(`User ${userId} authenticated on socket ${socket.id}`);
                        
                        // Join a room specific to this user
                        socket.join(`user-${userId}`);
                    }
                });
                
                // Handle disconnection
                socket.on('disconnect', () => {
                    if (socket.userId) {
                        this.connectedUsers.delete(socket.userId);
                        logger.info(`User ${socket.userId} disconnected from socket ${socket.id}`);
                    }
                });
            });
            
            logger.info(`Socket.IO server initialized on port ${SOCKET_IO_PORT}`);
        } catch (error) {
            logger.error(`Error initializing Socket.IO server: ${error.message}`);
            throw new NotificationError(`Failed to initialize Socket.IO server: ${error.message}`);
        }
    }

    async sendNotification(userId, notification) {
        try {
            if (!this.io) {
                throw new NotificationError('Socket.IO server not initialized');
            }
            
            // Send to specific user's room
            this.io.to(`user-${userId}`).emit('notification', notification);
            
            logger.info(`In-app notification sent to user ${userId}`);
            
            return {
                success: true
            };
        } catch (error) {
            logger.error(`Error sending in-app notification: ${error.message}`);
            throw new NotificationError(`Failed to send in-app notification: ${error.message}`);
        }
    }

    async broadcastNotification(notification, filter = {}) {
        try {
            if (!this.io) {
                throw new NotificationError('Socket.IO server not initialized');
            }
            
            // Broadcast to all connected clients or filtered subset
            if (Object.keys(filter).length === 0) {
                this.io.emit('notification', notification);
                logger.info('In-app notification broadcasted to all users');
            } else {
                // Example of filtering by user role or other criteria
                // This would require storing additional user metadata
                // Implementation depends on your specific requirements
                logger.info('Filtered broadcast not implemented');
            }
            
            return {
                success: true
            };
        } catch (error) {
            logger.error(`Error broadcasting in-app notification: ${error.message}`);
            throw new NotificationError(`Failed to broadcast in-app notification: ${error.message}`);
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

module.exports = InAppService; 