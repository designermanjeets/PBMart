# RFQ Service

## Overview
The RFQ (Request for Quotation) Service is a microservice component of the B2B E-commerce Platform. It manages the entire RFQ lifecycle, allowing buyers to create requests for quotations and vendors to submit quotes in response.

## Features
- Create, read, update, and delete RFQs
- Invite vendors to participate in RFQs
- Submit quotes in response to RFQs
- Track RFQ and quote statuses
- Automatic expiration of RFQs and quotes based on configured timeframes
- Event-driven communication with other services

## Tech Stack
- Node.js
- Express.js
- MongoDB (via Mongoose)
- RabbitMQ for message broker
- JWT for authentication

## API Endpoints

### RFQ Endpoints
- `GET /api/rfq` - Get all RFQs (filtered by user role)
- `POST /api/rfq` - Create a new RFQ
- `GET /api/rfq/:id` - Get RFQ by ID
- `PUT /api/rfq/:id` - Update an RFQ
- `DELETE /api/rfq/:id` - Delete an RFQ
- `POST /api/rfq/:id/vendors` - Invite vendors to an RFQ
- `PUT /api/rfq/:id/vendors/:vendorId` - Update vendor status for an RFQ
- `GET /api/rfq/:id/quotes` - Get all quotes for an RFQ

### Quote Endpoints
- `GET /api/quotes` - Get all quotes (filtered by user role)
- `POST /api/quotes` - Create a new quote
- `GET /api/quotes/:id` - Get quote by ID
- `PUT /api/quotes/:id` - Update a quote
- `DELETE /api/quotes/:id` - Delete a quote

### Other Endpoints
- `GET /health` - Health check endpoint
- `GET /rfq` - Test route with API information
- `GET /api` - API information

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- RabbitMQ

### Environment Variables
Create `.env.dev` and `.env.prod` files with the following variables:
```
PORT=8011
APP_SECRET=your_app_secret
MONGODB_URI=mongodb://nosql-db:27017/rfq-service
MESSAGE_BROKER_URL=amqp://rabbitmq:5672
EXCHANGE_NAME=B2B_EXCHANGE
QUEUE_NAME=rfq_queue
LOG_LEVEL=debug (or info for prod)
RFQ_EXPIRY_DAYS=7
QUOTE_EXPIRY_DAYS=14
```

### Running the Service

#### Using Docker
```bash
docker-compose up rfq-service
```

#### Without Docker
```bash
npm install
npm run dev  # For development
npm start    # For production
```

## Architecture

### Directory Structure
```
rfq/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── index.js
│   ├── config/
│   ├── database/
│   │   ├── models/
│   │   ├── repository/
│   │   └── connection.js
│   ├── services/
│   ├── utils/
│   ├── express-app.js
│   └── index.js
├── uploads/
├── .env.dev
├── .env.prod
├── Dockerfile
└── package.json
```

### Event-Driven Communication
The RFQ service publishes and subscribes to the following events:

#### Published Events
- `rfq.created` - When a new RFQ is created
- `rfq.updated` - When an RFQ is updated
- `rfq.expired` - When an RFQ expires
- `quote.submitted` - When a quote is submitted
- `quote.accepted` - When a quote is accepted
- `quote.rejected` - When a quote is rejected

#### Subscribed Events
- `vendor.verified` - When a vendor is verified
- `product.updated` - When product information is updated

## Authentication and Authorization
- JWT-based authentication
- Role-based access control:
  - Buyers can create and manage RFQs
  - Vendors can submit and manage quotes
  - Admins have full access to all resources

## Error Handling
The service implements a centralized error handling mechanism with custom error classes:
- `ValidationError` - For input validation errors
- `NotFoundError` - When a resource is not found
- `AuthenticationError` - For authentication issues
- `AuthorizationError` - For permission issues
- `ConflictError` - For conflicts like duplicate entries

## Logging
Winston-based logging with configurable log levels.

## Integration with Other Services
- Vendor Service - For vendor information and verification
- Notification Service - For sending notifications about RFQs and quotes
- Product Service - For product information in RFQs and quotes
- Customer Service - For buyer information

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License. 