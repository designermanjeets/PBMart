# Payment Service

## Overview
The Payment Service is a microservice responsible for handling all payment-related operations in the B2B E-commerce platform. It manages payment processing, invoicing, transaction history, and integration with payment gateways.

## Features
- **Payment Processing**: Process payments through multiple payment gateways
- **Invoice Generation**: Create and manage invoices for orders
- **Payment History**: Track and retrieve payment history
- **Refund Processing**: Handle refund requests
- **Payment Verification**: Verify payment status and authenticity
- **Subscription Management**: Handle recurring payments and subscriptions
- **Multi-Currency Support**: Process payments in different currencies
- **Tax Calculation**: Calculate and apply taxes to payments
- **Payment Analytics**: Generate reports on payment trends

## Architecture
The service follows a clean architecture pattern:
- **API Layer**: Express.js routes for handling HTTP requests
- **Service Layer**: Business logic for payment processing
- **Repository Layer**: Database operations for payments and invoices
- **Models**: MongoDB schemas for data structure
- **Utils**: Shared utilities for messaging, error handling, etc.

## Technical Stack
- Node.js & Express.js
- MongoDB (via Mongoose)
- RabbitMQ for event messaging
- PDF generation for invoices
- Integration with payment gateways (Stripe, PayPal, etc.)

## API Endpoints

### Payment Endpoints
- `GET /api/payment` - Service information
- `GET /api/payment/health` - Health check
- `POST /api/payment/create` - Create a new payment
- `POST /api/payment/process` - Process a payment
- `GET /api/payment/verify/:id` - Verify payment status
- `GET /api/payment/history` - Get payment history
- `GET /api/payment/history/:id` - Get specific payment details
- `POST /api/payment/refund` - Process a refund
- `GET /api/payment/invoice/:id` - Get invoice by ID
- `GET /api/payment/invoice/:id/download` - Download invoice as PDF

## Event Subscriptions
The service subscribes to the following events:
- `ORDER_CREATED` - Create payment for new order
- `ORDER_UPDATED` - Update payment details if order changes
- `ORDER_CANCELLED` - Process refund if necessary
- `SUBSCRIPTION_RENEWED` - Process recurring payment

## Event Publications
The service publishes the following events:
- `PAYMENT_CREATED` - When a new payment is created
- `PAYMENT_PROCESSED` - When a payment is successfully processed
- `PAYMENT_FAILED` - When a payment fails
- `REFUND_PROCESSED` - When a refund is processed
- `INVOICE_GENERATED` - When a new invoice is generated

## Configuration
Configuration is managed through environment variables:
- Basic service configuration (PORT, DB_URL, etc.)
- Message broker settings
- Payment gateway API keys
- Invoice generation settings
- Tax calculation settings

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

## Payment Gateway Integration
The service supports integration with multiple payment gateways:
- **Stripe**: For credit card processing
- **PayPal**: For PayPal account payments
- **Bank Transfer**: For direct bank transfers
- **Custom Gateway**: Framework for adding custom payment methods

To add a new payment gateway:
1. Create a new gateway adapter in `src/services/payment-gateways/`
2. Implement the standard gateway interface
3. Register the gateway in the payment service
4. Update the payment processing logic to support the new gateway

## Future Enhancements
1. **Blockchain Payments**: Add support for cryptocurrency payments
2. **Payment Splitting**: Support for splitting payments between multiple recipients
3. **Advanced Fraud Detection**: Implement AI-based fraud detection
4. **Payment Links**: Generate shareable payment links
5. **Installment Plans**: Support for paying in installments
6. **Dynamic Pricing**: Adjust prices based on various factors
7. **Loyalty Points**: Integrate with loyalty/rewards system
8. **Advanced Reporting**: More detailed financial reports
9. **Payment Webhooks**: Allow external systems to receive payment events
10. **Multi-Vendor Settlements**: Handle payments for marketplace model

## Troubleshooting
- Check logs for detailed error messages
- Verify database connection
- Ensure message broker is running
- Check payment gateway API credentials
- Verify invoice generation functionality 