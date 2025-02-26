# Notification Service

## Overview
The Notification Service is a microservice responsible for sending various types of notifications to users in the B2B E-commerce platform. It supports email, SMS, and in-app notifications, with a template system for consistent messaging.

## Features
- **Email Notifications**: Send transactional and marketing emails using Nodemailer
- **SMS Notifications**: Send text messages using Twilio API
- **In-App Notifications**: Real-time notifications using Socket.IO
- **Template Management**: Create, update, and manage notification templates
- **Event-Based Notifications**: Subscribe to system events and send appropriate notifications
- **User Notification Preferences**: Support for user-specific notification settings

## Architecture
The service follows a clean architecture pattern:
- **API Layer**: Express.js routes for handling HTTP requests
- **Service Layer**: Business logic for notification processing
- **Repository Layer**: Database operations for notifications and templates
- **Models**: MongoDB schemas for data structure
- **Utils**: Shared utilities for messaging, error handling, etc.

## Technical Stack
- Node.js & Express.js
- MongoDB (via Mongoose)
- RabbitMQ for event messaging
- Socket.IO for real-time notifications
- Nodemailer for email delivery
- Twilio for SMS delivery

## API Endpoints

### Notification Endpoints
- `GET /api/notification` - Service information
- `GET /api/notification/health` - Health check
- `POST /api/notification/email` - Send email notification
- `POST /api/notification/sms` - Send SMS notification
- `POST /api/notification/inapp` - Send in-app notification
- `GET /api/notification/user` - Get user's notifications
- `GET /api/notification/:id` - Get notification by ID
- `PATCH /api/notification/:id/read` - Mark notification as read
- `PATCH /api/notification/user/read-all` - Mark all notifications as read
- `GET /api/notification/user/unread-count` - Get unread notifications count

### Template Endpoints
- `GET /api/notification/template` - Get all templates (admin only)
- `GET /api/notification/template/:id` - Get template by ID (admin only)
- `POST /api/notification/template` - Create new template (admin only)
- `PUT /api/notification/template/:id` - Update template (admin only)
- `DELETE /api/notification/template/:id` - Delete template (admin only)

## Event Subscriptions
The service subscribes to the following events:
- `USER_REGISTERED` - Send welcome email
- `ORDER_CREATED` - Send order confirmation
- `ORDER_SHIPPED` - Send shipping notification
- `PASSWORD_RESET` - Send password reset instructions
- `PAYMENT_RECEIVED` - Send payment confirmation

## Configuration
Configuration is managed through environment variables:
- Basic service configuration (PORT, DB_URL, etc.)
- Message broker settings
- Email service settings (SMTP)
- SMS service settings (Twilio)
- Socket.IO settings

## Development

### Prerequisites
- Node.js v14+
- MongoDB
- RabbitMQ

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.dev` and `.env.prod`)
4. Start the service: `npm run dev` (development) or `npm start` (production)

### Testing
Run tests with: `npm test`

## Future Enhancements
1. **Notification Batching**: Group similar notifications to reduce noise
2. **Rich Media Support**: Add support for images and attachments in notifications
3. **Notification Analytics**: Track open rates, click rates, etc.
4. **Advanced Templating**: Support for more complex templates with conditional sections
5. **Push Notifications**: Add support for mobile push notifications
6. **Scheduled Notifications**: Allow scheduling notifications for future delivery
7. **Internationalization**: Support for multiple languages in notifications
8. **Rate Limiting**: Prevent notification flooding
9. **Notification Preferences Center**: UI for users to manage their notification preferences
10. **Webhook Support**: Allow external systems to trigger notifications

## Troubleshooting
- Check logs for detailed error messages
- Verify database connection
- Ensure message broker is running
- Check email/SMS provider credentials
- Verify Socket.IO connection for in-app notifications 