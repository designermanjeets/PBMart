# Tenant Service - Technical Documentation

## Overview

The Tenant Service is a core microservice in our B2B eCommerce platform that manages tenant (business) accounts, authentication, and subscription management. This service is built using a modern microservices architecture with resilience patterns to ensure high availability and fault tolerance.

## Architecture

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Message Broker**: RabbitMQ
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker

### Architectural Patterns

The Tenant Service implements several architectural and resilience patterns:

1. **Circuit Breaker Pattern**: Prevents cascading failures by detecting failures and avoiding making calls to failing services.
2. **Message-based Communication**: Uses RabbitMQ for asynchronous communication with other services.
3. **Repository Pattern**: Abstracts database operations from business logic.
4. **Health Checks**: Provides endpoints to monitor service health.
5. **Structured Logging**: Uses Winston for consistent, structured logging.

### Directory Structure

tenant/
├── src/
│   ├── api/
│   │   ├── middlewares/     # Express middlewares
│   │   └── tenant.js        # Tenant API endpoints
│   ├── config/              # Configuration files
│   ├── database/            # Database connection and models
│   │   ├── models/          # Mongoose models
│   │   └── repository/      # Repository pattern implementation
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   │   ├── circuit-breaker.js  # Circuit breaker implementation
│   │   ├── logger.js        # Logging utility
│   │   └── index.js         # Common utilities
│   ├── express-app.js       # Express application setup
│   └── index.js             # Application entry point
├── Dockerfile               # Docker configuration
├── package.json             # Dependencies and scripts
└── README.md                # This documentation
```

## API Endpoints

### Authentication

#### Sign Up
- **URL**: `/signup`
- **Method**: `POST`
- **Description**: Register a new tenant
- **Request Body**:
  ```json
  {
    "name": "Business Name",
    "email": "admin@business.com",
    "password": "securepassword",
    "phone": "1234567890",
    "companyName": "Business Inc.",
    "businessType": "Retail",
    "address": {
      "street": "123 Business St",
      "city": "Business City",
      "state": "BS",
      "country": "USA",
      "zipCode": "12345"
    }
  }
  ```
- **Response**: JWT token and tenant ID

#### Sign In
- **URL**: `/signin`
- **Method**: `POST`
- **Description**: Authenticate a tenant
- **Request Body**:
  ```json
  {
    "email": "admin@business.com",
    "password": "securepassword"
  }
  ```
- **Response**: JWT token and tenant ID

### Tenant Management

#### Get Tenant Profile
- **URL**: `/profile`
- **Method**: `GET`
- **Description**: Get the profile of the authenticated tenant
- **Authentication**: Required (JWT)
- **Response**: Tenant profile data

#### Update Tenant Profile
- **URL**: `/profile`
- **Method**: `PUT`
- **Description**: Update tenant profile
- **Authentication**: Required (JWT)
- **Request Body**: Fields to update
- **Response**: Updated tenant profile

### Admin Endpoints

#### Get All Tenants
- **URL**: `/admin/tenants`
- **Method**: `GET`
- **Description**: Get a list of all tenants (admin only)
- **Authentication**: Required (JWT with admin role)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status
- **Response**: List of tenants with pagination

#### Verify Tenant
- **URL**: `/admin/tenants/:id/verify`
- **Method**: `PUT`
- **Description**: Verify a tenant account (admin only)
- **Authentication**: Required (JWT with admin role)
- **Response**: Updated tenant data

#### Deactivate Tenant
- **URL**: `/admin/tenants/:id/deactivate`
- **Method**: `PUT`
- **Description**: Deactivate a tenant account (admin only)
- **Authentication**: Required (JWT with admin role)
- **Response**: Updated tenant data

#### Change Subscription
- **URL**: `/admin/tenants/:id/subscription`
- **Method**: `PUT`
- **Description**: Change a tenant's subscription plan (admin only)
- **Authentication**: Required (JWT with admin role)
- **Request Body**:
  ```json
  {
    "plan": "premium",
    "expiryDate": "2023-12-31T23:59:59Z"
  }
  ```
- **Response**: Updated tenant data

### Health Check

#### Health Check Endpoint
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Check the health of the service
- **Response**: Service health status including database and message broker connectivity
  ```json
  {
    "service": "Tenant Service",
    "status": "active",
    "time": "2023-05-15T10:30:45.123Z",
    "database": "connected",
    "messageBroker": "connected"
  }
  ```

## Resilience Features

### Circuit Breaker

The circuit breaker pattern is implemented to prevent cascading failures. When a dependent service or database operation fails repeatedly, the circuit breaker "opens" and fails fast, preventing resource exhaustion.

## Environment Variables

The service uses the following environment variables:

- `APP_SECRET`: Secret key for JWT signing
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Service port (default: 8004)
- `MESSAGE_BROKER_URL`: RabbitMQ connection string
- `EXCHANGE_NAME`: RabbitMQ exchange name
- `QUEUE_NAME`: RabbitMQ queue name
- `NODE_ENV`: Environment (development/production)

## Troubleshooting

### Common Issues

1. **Database Connection Failures**:
   - Check MongoDB connection string
   - Verify network connectivity
   - Check MongoDB logs

2. **Message Broker Issues**:
   - Verify RabbitMQ is running
   - Check connection string
   - Ensure exchanges and queues are properly configured

3. **Authentication Failures**:
   - Verify JWT token is properly formatted
   - Check if token is expired
   - Ensure APP_SECRET is consistent

### Monitoring

- Use the `/health` endpoint to check service health
- Monitor logs in the `logs/` directory
- Set up alerts for error-level log entries

## Best Practices

1. **Error Handling**: Always use try-catch blocks and pass errors to the next middleware
2. **Validation**: Validate all input data before processing
3. **Logging**: Use appropriate log levels (info, warn, error)
4. **Circuit Breaking**: Use circuit breakers for external dependencies
5. **Testing**: Write unit and integration tests for new features

## Conclusion

The Tenant Service is designed with scalability, resilience, and maintainability in mind. By following the patterns and practices outlined in this documentation, you can extend and enhance the service while maintaining its reliability.

### Structured Logging

Winston logger is used for structured logging with different log levels:

```javascript
// Example logging
logger.info(`New tenant created: ${tenant._id}`);
logger.error(`Error in SignIn: ${err.message}`);
logger.warn(`Unauthorized access attempt: ${req.method} ${req.originalUrl}`);
```

### Health Checks

The health check endpoint monitors:
- Database connectivity
- Message broker connectivity
- Service status

## Message Broker Integration

The Tenant Service communicates with other services using RabbitMQ:

### Publishing Messages

```javascript
// Example of publishing a message
await PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify({
    event: 'TENANT_CREATED',
    data: { tenantId: tenant._id, email: tenant.email }
}));
```

### Subscribing to Messages

```javascript
// Example of subscribing to messages
SubscribeMessage(channel, service);

// In the service
async SubscribeEvents(payload) {
    const { event, data } = payload;
    
    switch(event) {
        case 'CUSTOMER_CREATED':
            // Handle customer created event
            break;
        // Other event types
    }
}
```

## Error Handling

The service implements a centralized error handling middleware:

```javascript
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    
    const statusCode = err.statusCode || 500;
    const data = {
        error: err.name || 'Internal Server Error',
        message: err.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    
    res.status(statusCode).json(data);
});
```

## Database Schema

### Tenant Model

```javascript
const TenantSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    companyName: String,
    businessType: String,
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended'],
        default: 'pending'
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium'],
            default: 'free'
        },
        expiryDate: Date
    },
    createdAt: { type: Date, default: Date.now }
});
```

## Extending the Service

### Adding a New API Endpoint

1. Define the route in `src/api/tenant.js`:

```javascript
app.get('/new-endpoint', UserAuth, async (req, res, next) => {
    try {
        const data = await service.NewFeature(req.user._id);
        return res.json(data);
    } catch (err) {
        next(err);
    }
});
```

2. Implement the business logic in `src/services/tenant-service.js`:

```javascript
async NewFeature(tenantId) {
    try {
        return await this.circuitBreaker.execute(async () => {
            // Implementation
            const result = await this.repository.SomeOperation(tenantId);
            logger.info(`New feature used by tenant: ${tenantId}`);
            return FormateData(result);
        });
    } catch (err) {
        logger.error(`Error in NewFeature: ${err.message}`);
        throw new APIError('Error in new feature', err);
    }
}
```

3. Add repository methods if needed in `src/database/repository/tenant-repository.js`:

```javascript
async SomeOperation(tenantId) {
    try {
        // Database operations
        return result;
    } catch (err) {
        throw new APIError('Database error', err);
    }
}
```

### Adding a New Event

1. Define the event handler in the service:

```javascript
// In SubscribeEvents method
case 'NEW_EVENT_TYPE':
    await this.HandleNewEvent(data);
    break;

// New method
async HandleNewEvent(data) {
    // Implementation
}
```

2. Publish the event when needed:

```javascript
const payload = {
    event: 'NEW_EVENT_FROM_TENANT',
    data: { /* event data */ }
};

await PublishMessage(channel, TARGET_SERVICE, JSON.stringify(payload));
```

## Deployment

The service is containerized using Docker and can be deployed with Docker Compose:

```bash
# Build and start the service
docker-compose up -d tenant

# View logs
docker-compose logs -f tenant

# Restart the service
docker-compose restart tenant
```

## Environment Variables

The service uses the following environment variables:

- `APP_SECRET`: Secret key for JWT signing
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Service port (default: 8004)
- `MESSAGE_BROKER_URL`: RabbitMQ connection string
- `EXCHANGE_NAME`: RabbitMQ exchange name
- `QUEUE_NAME`: RabbitMQ queue name
- `NODE_ENV`: Environment (development/production)

## Troubleshooting

### Common Issues

1. **Database Connection Failures**:
   - Check MongoDB connection string
   - Verify network connectivity
   - Check MongoDB logs

2. **Message Broker Issues**:
   - Verify RabbitMQ is running
   - Check connection string
   - Ensure exchanges and queues are properly configured

3. **Authentication Failures**:
   - Verify JWT token is properly formatted
   - Check if token is expired
   - Ensure APP_SECRET is consistent

### Monitoring

- Use the `/health` endpoint to check service health
- Monitor logs in the `logs/` directory
- Set up alerts for error-level log entries

## Best Practices

1. **Error Handling**: Always use try-catch blocks and pass errors to the next middleware
2. **Validation**: Validate all input data before processing
3. **Logging**: Use appropriate log levels (info, warn, error)
4. **Circuit Breaking**: Use circuit breakers for external dependencies
5. **Testing**: Write unit and integration tests for new features

## Conclusion

The Tenant Service is designed with scalability, resilience, and maintainability in mind. By following the patterns and practices outlined in this documentation, you can extend and enhance the service while maintaining its reliability. 