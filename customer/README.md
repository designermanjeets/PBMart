# Customer Service - Technical Documentation

## Overview

The Customer Service is a core microservice in our B2B eCommerce platform that manages customer accounts, authentication, and profile management. This service enables end customers of tenant businesses to register, authenticate, and manage their shopping experience. It's built using a modern microservices architecture with resilience patterns to ensure high availability and fault tolerance.

## Architecture

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Message Broker**: RabbitMQ
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker

### Architectural Patterns

The Customer Service implements several architectural and resilience patterns:

1. **Circuit Breaker Pattern**: Prevents cascading failures by detecting failures and avoiding making calls to failing services.
2. **Message-based Communication**: Uses RabbitMQ for asynchronous communication with other services.
3. **Repository Pattern**: Abstracts database operations from business logic.
4. **Health Checks**: Provides endpoints to monitor service health.
5. **Structured Logging**: Uses Winston for consistent, structured logging.

### Directory Structure

```
customer/
├── src/
│   ├── api/                 # API routes and controllers
│   │   ├── middlewares/     # Express middlewares
│   │   └── customer.js      # Customer API endpoints
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
- **Description**: Register a new customer
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "securepassword",
    "phone": "1234567890"
  }
  ```
- **Response**: JWT token and customer ID

#### Sign In
- **URL**: `/signin`
- **Method**: `POST`
- **Description**: Authenticate a customer
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: JWT token and customer ID

### Customer Profile Management

#### Get Customer Profile
- **URL**: `/profile`
- **Method**: `GET`
- **Description**: Get the profile of the authenticated customer
- **Authentication**: Required (JWT)
- **Response**: Customer profile data

#### Update Customer Profile
- **URL**: `/profile`
- **Method**: `PUT`
- **Description**: Update customer profile
- **Authentication**: Required (JWT)
- **Request Body**: Fields to update
- **Response**: Updated customer profile

### Address Management

#### Add Address
- **URL**: `/address`
- **Method**: `POST`
- **Description**: Add a new address for the customer
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "ST",
    "country": "USA",
    "zipCode": "12345"
  }
  ```
- **Response**: Updated customer with new address

#### Get Addresses
- **URL**: `/address`
- **Method**: `GET`
- **Description**: Get all addresses for the customer
- **Authentication**: Required (JWT)
- **Response**: List of customer addresses

#### Delete Address
- **URL**: `/address/:id`
- **Method**: `DELETE`
- **Description**: Delete a customer address
- **Authentication**: Required (JWT)
- **Response**: Updated customer data

### Wishlist Management

#### Add to Wishlist
- **URL**: `/wishlist`
- **Method**: `POST`
- **Description**: Add a product to customer's wishlist
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "productId": "product_id_here"
  }
  ```
- **Response**: Updated wishlist

#### Get Wishlist
- **URL**: `/wishlist`
- **Method**: `GET`
- **Description**: Get customer's wishlist
- **Authentication**: Required (JWT)
- **Response**: List of products in wishlist

#### Remove from Wishlist
- **URL**: `/wishlist/:id`
- **Method**: `DELETE`
- **Description**: Remove a product from wishlist
- **Authentication**: Required (JWT)
- **Response**: Updated wishlist

### Health Check

#### Health Check Endpoint
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Check the health of the service
- **Response**: Service health status including database and message broker connectivity
  ```json
  {
    "service": "Customer Service",
    "status": "active",
    "time": "2023-05-15T10:30:45.123Z",
    "database": "connected",
    "messageBroker": "connected"
  }
  ```

## Resilience Features

### Circuit Breaker

The circuit breaker pattern is implemented to prevent cascading failures. When a dependent service or database operation fails repeatedly, the circuit breaker "opens" and fails fast, preventing resource exhaustion.

```javascript
// Example usage in a service
async SignUp(userInputs) {
    try {
        return await this.circuitBreaker.execute(async () => {
            // Database operations that might fail
            // ...
        });
    } catch (err) {
        logger.error(`Error in SignUp: ${err.message}`);
        throw new APIError('Data Not found', err);
    }
}
```

### Structured Logging

Winston logger is used for structured logging with different log levels:

```javascript
// Example logging
logger.info(`New customer created: ${customer._id}`);
logger.error(`Error in SignIn: ${err.message}`);
logger.warn(`Unauthorized access attempt: ${req.method} ${req.originalUrl}`);
```

### Health Checks

The health check endpoint monitors:
- Database connectivity
- Message broker connectivity
- Service status

## Message Broker Integration

The Customer Service communicates with other services using RabbitMQ:

### Publishing Messages

```javascript
// Example of publishing a message
await PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify({
    event: 'CUSTOMER_CREATED',
    data: { customerId: customer._id, email: customer.email }
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
        case 'ORDER_CREATED':
            // Handle order created event
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

### Customer Model

```javascript
const CustomerSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    salt: String,
    phone: String,
    addresses: [
        { 
            type: Schema.Types.ObjectId,
            ref: 'address'
        }
    ],
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: 'product'
        }
    ],
    orders: [
        {
            type: Schema.Types.ObjectId,
            ref: 'order'
        }
    ],
    cart: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'product'
            },
            unit: { type: Number, require: true }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});
```

### Address Model

```javascript
const AddressSchema = new Schema({
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
});
```

## Extending the Service

### Adding a New API Endpoint

1. Define the route in `src/api/customer.js`:

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

2. Implement the business logic in `src/services/customer-service.js`:

```javascript
async NewFeature(customerId) {
    try {
        return await this.circuitBreaker.execute(async () => {
            // Implementation
            const result = await this.repository.SomeOperation(customerId);
            logger.info(`New feature used by customer: ${customerId}`);
            return FormateData(result);
        });
    } catch (err) {
        logger.error(`Error in NewFeature: ${err.message}`);
        throw new APIError('Error in new feature', err);
    }
}
```

3. Add repository methods if needed in `src/database/repository/customer-repository.js`:

```javascript
async SomeOperation(customerId) {
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
    event: 'NEW_EVENT_FROM_CUSTOMER',
    data: { /* event data */ }
};

await PublishMessage(channel, TARGET_SERVICE, JSON.stringify(payload));
```

## Deployment

The service is containerized using Docker and can be deployed with Docker Compose:

```bash
# Build and start the service
docker-compose up -d customer

# View logs
docker-compose logs -f customer

# Restart the service
docker-compose restart customer
```

## Environment Variables

The service uses the following environment variables:

- `APP_SECRET`: Secret key for JWT signing
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Service port (default: 8001)
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

The Customer Service is designed with scalability, resilience, and maintainability in mind. By following the patterns and practices outlined in this documentation, you can extend and enhance the service while maintaining its reliability. 