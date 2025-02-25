# Shopping Service - Technical Documentation

## Overview

The Shopping Service is a core microservice in our B2B eCommerce platform that manages shopping carts, orders, and checkout processes. This service enables customers to add products to their cart, place orders, and track their order history. It's built using a modern microservices architecture with resilience patterns to ensure high availability and fault tolerance.

## Architecture

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Message Broker**: RabbitMQ
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker

### Architectural Patterns

The Shopping Service implements several architectural and resilience patterns:

1. **Circuit Breaker Pattern**: Prevents cascading failures by detecting failures and avoiding making calls to failing services.
2. **Message-based Communication**: Uses RabbitMQ for asynchronous communication with other services.
3. **Repository Pattern**: Abstracts database operations from business logic.
4. **Health Checks**: Provides endpoints to monitor service health.
5. **Structured Logging**: Uses Winston for consistent, structured logging.

### Directory Structure

```
shopping/
├── src/
│   ├── api/                 # API routes and controllers
│   │   ├── middlewares/     # Express middlewares
│   │   └── shopping.js      # Shopping API endpoints
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

### Shopping Cart Management

#### Get Cart
- **URL**: `/cart`
- **Method**: `GET`
- **Description**: Get the current user's shopping cart
- **Authentication**: Required (JWT)
- **Response**: Cart items with product details

#### Add to Cart
- **URL**: `/cart`
- **Method**: `PUT`
- **Description**: Add a product to the cart
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "_id": "product_id_here"
  }
  ```
- **Response**: Updated cart data

#### Remove from Cart
- **URL**: `/cart`
- **Method**: `DELETE`
- **Description**: Remove a product from the cart
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "_id": "product_id_here"
  }
  ```
- **Response**: Updated cart data

### Order Management

#### Place Order
- **URL**: `/order`
- **Method**: `POST`
- **Description**: Create a new order from the cart items
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "txnNumber": "transaction_id_here"
  }
  ```
- **Response**: Order details

#### Get Orders
- **URL**: `/orders`
- **Method**: `GET`
- **Description**: Get all orders for the current user
- **Authentication**: Required (JWT)
- **Response**: List of orders with details

#### Get Order by ID
- **URL**: `/order/:id`
- **Method**: `GET`
- **Description**: Get a specific order by ID
- **Authentication**: Required (JWT)
- **Response**: Order details

### Checkout Process

#### Initiate Checkout
- **URL**: `/checkout/init`
- **Method**: `POST`
- **Description**: Initialize the checkout process
- **Authentication**: Required (JWT)
- **Response**: Checkout session details

#### Complete Checkout
- **URL**: `/checkout/complete`
- **Method**: `POST`
- **Description**: Complete the checkout process
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "sessionId": "checkout_session_id",
    "paymentStatus": "completed"
  }
  ```
- **Response**: Order confirmation

### Health Check

#### Health Check Endpoint
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Check the health of the service
- **Response**: Service health status including database and message broker connectivity
  ```json
  {
    "service": "Shopping Service",
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
async PlaceOrder(userInput) {
    try {
        return await this.circuitBreaker.execute(async () => {
            // Database operations that might fail
            const orderResult = await this.repository.CreateNewOrder(userInput._id, userInput.txnNumber);
            logger.info(`New order created: ${orderResult._id}`);
            return FormateData(orderResult);
        });
    } catch (err) {
        logger.error(`Error in PlaceOrder: ${err.message}`);
        throw new APIError('Data Not found', err);
    }
}
```

### Structured Logging

Winston logger is used for structured logging with different log levels:

```javascript
// Example logging
logger.info(`New order created: ${order._id}`);
logger.error(`Error in GetOrders: ${err.message}`);
logger.warn(`Unauthorized access attempt: ${req.method} ${req.originalUrl}`);
```

### Health Checks

The health check endpoint monitors:
- Database connectivity
- Message broker connectivity
- Service status

## Message Broker Integration

The Shopping Service communicates with other services using RabbitMQ:

### Publishing Messages

```javascript
// Example of publishing a message
await PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify({
    event: 'CREATE_ORDER',
    data: { userId, order }
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
        case 'ADD_TO_CART':
            await this.ManageCart(data.userId, data.product, data.qty, false);
            break;
        case 'REMOVE_FROM_CART':
            await this.ManageCart(data.userId, data.product, data.qty, true);
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

### Cart Model

```javascript
const CartSchema = new Schema({
    customerId: { type: String },
    items: [
        {
            product: {
                _id: { type: String, required: true },
                name: { type: String },
                desc: { type: String },
                banner: { type: String },
                type: { type: String },
                unit: { type: Number },
                price: { type: Number },
                suplier: { type: String }
            },
            unit: { type: Number, required: true }
        }
    ]
});
```

### Order Model

```javascript
const OrderSchema = new Schema({
    orderId: String,
    customerId: String,
    amount: Number,
    status: String,
    items: [
        {
            product: {
                _id: { type: String },
                name: { type: String },
                desc: { type: String },
                banner: { type: String },
                type: { type: String },
                unit: { type: Number },
                price: { type: Number },
                suplier: { type: String }
            },
            unit: { type: Number }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    }
});
```

## Extending the Service

### Adding a New API Endpoint

1. Define the route in `src/api/shopping.js`:

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

2. Implement the business logic in `src/services/shopping-service.js`:

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

3. Add repository methods if needed in `src/database/repository/shopping-repository.js`:

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
    event: 'NEW_EVENT_FROM_SHOPPING',
    data: { /* event data */ }
};

await PublishMessage(channel, TARGET_SERVICE, JSON.stringify(payload));
```

## Deployment

The service is containerized using Docker and can be deployed with Docker Compose:

```bash
# Build and start the service
docker-compose up -d shopping

# View logs
docker-compose logs -f shopping

# Restart the service
docker-compose restart shopping
```

## Environment Variables

The service uses the following environment variables:

- `APP_SECRET`: Secret key for JWT signing
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Service port (default: 8003)
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

The Shopping Service is designed with scalability, resilience, and maintainability in mind. By following the patterns and practices outlined in this documentation, you can extend and enhance the service while maintaining its reliability. 