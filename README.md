# B2B eCommerce Platform

## Overview

This is a comprehensive B2B eCommerce platform built with a microservices architecture. The platform provides a complete solution for businesses to sell products to other businesses, with features including product management, customer management, order processing, payment processing, tenant management, admin functionality, notifications, and powerful search capabilities.

## Architecture

The platform is built using a microservices architecture, with each service responsible for a specific domain of functionality. The services communicate with each other through a combination of synchronous REST API calls and asynchronous message-based communication using RabbitMQ.

### Services

- **API Gateway**: Routes client requests to appropriate microservices
- **Customer Service**: Manages customer accounts and authentication
- **Product Service**: Handles product catalog and inventory
- **Shopping Service**: Manages shopping carts and orders
- **Tenant Service**: Supports multi-tenancy for different business entities
- **Admin Service**: Provides administrative functionality
- **Payment Service**: Processes payments and manages transactions
- **Notification Service**: Handles email, SMS, and in-app notifications
- **Search Service**: Provides powerful search capabilities using Elasticsearch
- **Vendor Service**: Manages vendor registration, verification, and performance tracking

### Technology Stack

- **Backend**: Node.js, Express.js
- **Databases**: MongoDB, Elasticsearch
- **Message Broker**: RabbitMQ
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- MongoDB (for local development)
- RabbitMQ (for local development)
- Elasticsearch (for search functionality)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/b2b-ecommerce.git
   cd b2b-ecommerce
   ```

2. Start the services using Docker Compose:
   ```
   docker-compose up -d
   ```

3. The API Gateway will be available at http://localhost:8000

### Development

For local development of individual services:

1. Navigate to the service directory:
   ```
   cd service-name
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the service in development mode:
   ```
   npm run dev
   ```

## API Documentation

API documentation is available at http://localhost:8000/api/docs when the platform is running.

## Service Details

### API Gateway (Port: 8000)

The API Gateway is the entry point for all client requests. It routes requests to the appropriate microservice, handles authentication, and provides a unified API for clients.

### Customer Service (Port: 8001)

Manages customer accounts, authentication, and customer-related operations.

### Product Service (Port: 8002)

Handles product catalog, categories, and inventory management.

### Shopping Service (Port: 8003)

Manages shopping carts, orders, and checkout processes.

### Tenant Service (Port: 8004)

Supports multi-tenancy, allowing multiple businesses to use the platform with their own isolated data.

### Admin Service (Port: 8005)

Provides administrative functionality for managing the platform.

### Payment Service (Port: 8006)

Processes payments, manages transactions, and handles payment-related operations.

### Notification Service (Port: 8007)

Handles email, SMS, and in-app notifications for various events in the system.

### Search Service (Port: 8009)

Provides powerful search capabilities using Elasticsearch, including full-text search, faceted search, autocomplete, and search analytics.

### Vendor Service
- **Port**: 8010
- **Description**: Manages vendor registration, verification, and performance tracking
- **Key Features**:
  - Vendor registration and profile management
  - Document verification process
  - Performance metrics tracking
  - Integration with product and order services

## Environment Variables

Each service has its own set of environment variables for configuration. These are defined in `.env.dev` and `.env.prod` files in each service directory.

## Testing

Run tests for all services:

```
npm test
```

Or for a specific service:

```
cd service-name
npm test
```

## Deployment

The platform can be deployed to various cloud providers using Docker and Kubernetes. Detailed deployment instructions are available in the `deployment` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped build this platform
- Special thanks to the open-source community for the amazing tools and libraries used in this project
