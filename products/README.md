# Products Service - Technical Documentation

## Overview

The Products Service is a core microservice in our B2B eCommerce platform that manages product catalogs, inventory, and product-related operations. This service enables businesses to create, update, and manage their product offerings, while allowing customers to browse and search for products. It's built using a modern microservices architecture with resilience patterns to ensure high availability and fault tolerance.

## Architecture

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Message Broker**: RabbitMQ
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker

### Architectural Patterns

The Products Service implements several architectural and resilience patterns:

1. **Circuit Breaker Pattern**: Prevents cascading failures by detecting failures and avoiding making calls to failing services.
2. **Message-based Communication**: Uses RabbitMQ for asynchronous communication with other services.
3. **Repository Pattern**: Abstracts database operations from business logic.
4. **Health Checks**: Provides endpoints to monitor service health.
5. **Structured Logging**: Uses Winston for consistent, structured logging.

### Directory Structure

```
products/
├── src/
│   ├── api/                 # API routes and controllers
│   │   ├── middlewares/     # Express middlewares
│   │   └── products.js      # Product API endpoints
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

### Product Management

#### Create Product
- **URL**: `/product/create`
- **Method**: `POST`
- **Description**: Create a new product
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "name": "Product Name",
    "desc": "Product description",
    "type": "electronics",
    "unit": "piece",
    "price": 99.99,
    "available": true,
    "suplier": "Supplier Name",
    "banner": "https://example.com/product-image.jpg"
  }
  ```
- **Response**: Created product data

#### Get All Products
- **URL**: `/products`
- **Method**: `GET`
- **Description**: Get all products
- **Response**: List of products with categories

#### Get Product by ID
- **URL**: `/product/:id`
- **Method**: `GET`
- **Description**: Get a specific product by ID
- **Response**: Product data

#### Get Products by Category
- **URL**: `/category/:type`
- **Method**: `GET`
- **Description**: Get products by category type
- **Response**: List of products in the specified category

### Inventory Management

#### Update Inventory
- **URL**: `/product/inventory/:id`
- **Method**: `PUT`
- **Description**: Update product inventory
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "available": true,
    "quantity": 100
  }
  ```
- **Response**: Updated product data

#### Bulk Update Products
- **URL**: `/products/bulk-update`
- **Method**: `POST`
- **Description**: Update multiple products at once
- **Authentication**: Required (JWT with admin role)
- **Request Body**:
  ```json
  {
    "products": [
      {
        "id": "product_id_1",
        "price": 89.99,
        "available": true
      },
      {
        "id": "product_id_2",
        "price": 129.99,
        "available": false
      }
    ]
  }
  ```
- **Response**: Status of the bulk update operation

### Shopping Cart Integration

#### Add to Cart
- **URL**: `/product/cart`
- **Method**: `POST`
- **Description**: Add product to cart (sends event to Shopping service)
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "productId": "product_id_here",
    "qty": 2
  }
  ```
- **Response**: Status of the operation

#### Remove from Cart
- **URL**: `/product/cart/:id`
- **Method**: `DELETE`
- **Description**: Remove product from cart (sends event to Shopping service)
- **Authentication**: Required (JWT)
- **Response**: Status of the operation

### Health Check

#### Health Check Endpoint
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Check the health of the service
- **Response**: Service health status including database and message broker connectivity
  ```json
  {
    "service": "Products Service",
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
async CreateProduct(productInputs) {
    try {
        return await this.circuitBreaker.execute(async () => {
            // Database operations that might fail
            const productResult = await this.repository.CreateProduct(productInputs);
            logger.info(`New product created: ${productResult._id}`);
            return FormateData(productResult);
        });
    } catch (err) {
        logger.error(`Error in CreateProduct: ${err.message}`);
        throw new APIError('Data Not found', err);
    }
}
```

### Structured Logging

Winston logger is used for structured logging with different log levels:

```javascript
// Example logging
logger.info(`New product created: ${product._id}`);
logger.error(`Error in GetProducts: ${err.message}`);
logger.warn(`Unauthorized access attempt: ${req.method} ${req.originalUrl}`);
```

### Health Checks

The health check endpoint monitors:
- Database connectivity
- Message broker connectivity
- Service status

## Message Broker Integration

The Products Service communicates with other services using RabbitMQ:

### Publishing Messages

```javascript
// Example of publishing a message
await PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify({
    event: 'ADD_TO_CART',
    data: { userId, product, qty }
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
        case 'UPDATE_INVENTORY':
            // Handle inventory update event
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

### Product Model

```javascript
const ProductSchema = new Schema({
    name: String,
    desc: String,
    banner: String,
    type: String,
    unit: Number,
    price: Number,
    available: Boolean,
    suplier: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
```

## Extending the Service

### Adding a New API Endpoint

1. Define the route in `src/api/products.js`:

```javascript
app.get('/new-endpoint', UserAuth, async (req, res, next) => {
    try {
        const data = await service.NewFeature(req.params.id);
        return res.json(data);
    } catch (err) {
        next(err);
    }
});
```

2. Implement the business logic in `src/services/product-service.js`:

```javascript
async NewFeature(productId) {
    try {
        return await this.circuitBreaker.execute(async () => {
            // Implementation
            const result = await this.repository.SomeOperation(productId);
            logger.info(`New feature used for product: ${productId}`);
            return FormateData(result);
        });
    } catch (err) {
        logger.error(`Error in NewFeature: ${err.message}`);
        throw new APIError('Error in new feature', err);
    }
}
```

3. Add repository methods if needed in `src/database/repository/product-repository.js`:

```javascript
async SomeOperation(productId) {
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
    event: 'NEW_EVENT_FROM_PRODUCTS',
    data: { /* event data */ }
};

await PublishMessage(channel, TARGET_SERVICE, JSON.stringify(payload));
```

## Deployment

The service is containerized using Docker and can be deployed with Docker Compose:

```bash
# Build and start the service
docker-compose up -d products

# View logs
docker-compose logs -f products

# Restart the service
docker-compose restart products
```

## Environment Variables

The service uses the following environment variables:

- `APP_SECRET`: Secret key for JWT signing
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Service port (default: 8002)
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

The Products Service is designed with scalability, resilience, and maintainability in mind. By following the patterns and practices outlined in this documentation, you can extend and enhance the service while maintaining its reliability. 