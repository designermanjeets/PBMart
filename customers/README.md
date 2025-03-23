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
│   │   └── customers.js     # Customer API endpoints
│   ├── config/              # Configuration files
│   ├── database/            # Database connection and models
│   │   ├── models/          # Mongoose models
│   │   └── repository/      # Repository pattern implementation
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   │   ├── errors.js        # Custom error classes
│   │   ├── logger.js        # Logging utility
│   │   └── index.js         # Common utilities
│   ├── express-app.js       # Express application setup
│   └── index.js             # Application entry point
├── Dockerfile               # Docker configuration
├── package.json             # Dependencies and scripts
└── README.md                # This documentation
```

## API Endpoints

### Root Endpoint

- **URL**: `/`
- **Method**: `GET`
- **Description**: Returns basic service information
- **Response**:
  ```json
  {
    "message": "Customer service API",
    "version": "1.0.0"
  }
  ```

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
- **Response**: JWT token and customer details

#### Login
- **URL**: `/login`
- **Method**: `POST`
- **Description**: Authenticate a customer
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: JWT token and customer details

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
- **Request Body**:
  ```json
  {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "postalCode": "12345",
      "country": "USA"
    }
  }
  ```
- **Response**: Updated customer profile

### Wishlist Management

#### Add to Wishlist
- **URL**: `/wishlist`
- **Method**: `POST`
- **Description**: Add a product to customer's wishlist
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "_id": "product_id",  // Optional - if product exists
    "name": "Product Name",
    "description": "Product Description",
    "price": 100,
    "available": true,
    "banner": "https://example.com/banner.jpg"
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

### Cart Management

#### Add to Cart
- **URL**: `/cart`
- **Method**: `POST`
- **Description**: Add a product to customer's cart
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "_id": "product_id",  // Optional - if product exists
    "name": "Product Name",
    "description": "Product Description",
    "price": 100,
    "available": true,
    "banner": "https://example.com/banner.jpg",
    "qty": 1  // Optional - defaults to 1
  }
  ```
- **Response**: Updated cart

#### Get Cart
- **URL**: `/cart`
- **Method**: `GET` 
- **Description**: Get customer's cart
- **Authentication**: Required (JWT)
- **Response**: List of products in cart

#### Remove from Cart
- **URL**: `/cart/:id`  
- **Method**: `DELETE`
- **Description**: Remove a product from cart
- **Authentication**: Required (JWT)
- **Response**: Updated cart    

### Order Management

#### Get Orders
- **URL**: `/orders`
- **Method**: `GET`
- **Description**: Get customer's orders
- **Authentication**: Required (JWT)
- **Response**: List of orders

### Database Testing

#### Test Database Connection
- **URL**: `/test-db`
- **Method**: `GET`
- **Description**: Test the database connection
- **Response**: Database connection status

## Error Handling

The service implements a centralized error handling approach with custom error classes:

- **ValidationError**: For input validation errors (400 Bad Request)
- **AuthenticationError**: For authentication failures (401 Unauthorized)
- **NotFoundError**: For resource not found errors (404 Not Found)
- **DatabaseError**: For database operation errors (500 Internal Server Error)

Example error response:
```json
{
  "status": "error",
  "message": "Error message details"
}
```

## Database Schema

### Customer Model

```javascript
const CustomerSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    phone: String,
    name: String,
    address: [
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
                _id: String,
                name: String,
                price: Number,
                banner: String
            },
            unit: { type: Number, require: true }
        }
    ],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
```

### Address Model

```javascript
const AddressSchema = new Schema({
    street: String,
    postalCode: String,
    city: String,
    country: String
});
```

## Message Broker Integration

The Customer Service communicates with other services using RabbitMQ:

### Publishing Messages

```javascript
await PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify({
    event: 'CUSTOMER_CREATED',
    data: { customerId: customer._id, email: customer.email }
}));
```

### Subscribing to Messages

```javascript
SubscribeMessage(channel, service);

// In the service
async SubscribeEvents(payload) {
    const { event, data } = payload;
    
    switch(event) {
        case 'ADD_TO_WISHLIST':
        case 'REMOVE_FROM_WISHLIST':
        case 'ADD_TO_CART':
        case 'REMOVE_FROM_CART':
        case 'CREATE_ORDER':
            this.repository.ManageCart(data.userId, data.product, data.qty, event);
            break;
        default:
            break;
    }
}
```

## Development Guide

### Setting Up the Development Environment

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create a `.env` file):
   ```
   APP_SECRET=your_jwt_secret
   MONGODB_URI=mongodb://localhost:27017/customer_service
   PORT=8001
   MESSAGE_BROKER_URL=amqp://localhost
   EXCHANGE_NAME=ONLINE_STORE
   ```
4. Start the service:
   ```bash
   npm run dev
   ```

### Adding a New API Endpoint

1. Define the route in `src/api/customers.js`:

```javascript
router.get('/new-endpoint', validateToken, async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { data } = await service.NewFeature(_id);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});
```

2. Implement the business logic in `src/services/customer-service.js`:

```javascript
async NewFeature(customerId) {
    try {
        // Implementation
        const result = await this.repository.SomeOperation(customerId);
        logger.info(`New feature used by customer: ${customerId}`);
        return FormateData(result);
    } catch (err) {
        logger.error(`Error in NewFeature: ${err.message}`);
        throw new DatabaseError(`Failed to execute new feature: ${err.message}`);
    }
}
```

3. Add repository methods if needed in `src/database/repository/customer-repository.js`:

```javascript
async SomeOperation(customerId) {
    try {
        // Database operations
        const customer = await this.FindCustomerById(customerId);
        // Perform operations
        return result;
    } catch (err) {
        logger.error(`Error in SomeOperation: ${err.message}`);
        throw err;
    }
}
```

### Input Validation

The service uses a validation middleware with Joi schemas:

```javascript
// Define schema in middlewares/schemas.js
const customerSchema = {
    signup: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().required()
    }),
    // Other schemas
};

// Use in routes
router.post('/signup', validateRequest(customerSchema.signup), async (req, res, next) => {
    // Route handler
});
```

### Authentication

The service uses JWT for authentication:

```javascript
// Generate token
const token = await GenerateSignature({
    email: customer.email,
    _id: customer._id
});

// Validate token middleware
router.get('/profile', validateToken, async (req, res, next) => {
    // Access authenticated user with req.user
});
```

### Error Handling Best Practices

1. Use try-catch blocks in all async functions
2. Use specific error types for different scenarios
3. Log errors with appropriate context
4. Pass errors to the next middleware for centralized handling

```javascript
try {
    // Operation that might fail
} catch (err) {
    logger.error(`Context: ${err.message}`);
    
    if (err.name === 'ValidationError') {
        throw new ValidationError(err.message);
    }
    
    throw new DatabaseError(`Operation failed: ${err.message}`);
}
```

## Testing

### Unit Testing

```bash
npm run test:unit
```

### Integration Testing

```bash
npm run test:integration
```

### Manual Testing with Postman

A Postman collection is available in the `docs/postman` directory for testing the API endpoints.

## Deployment

### Docker

```bash
# Build the image
docker build -t customer-service .

# Run the container
docker run -p 8001:8001 --env-file .env customer-service
```

### Docker Compose

```yaml
version: '3'
services:
  customer:
    build: ./customers
    ports:
      - "8001:8001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/customer_service
      - MESSAGE_BROKER_URL=amqp://rabbitmq
      - APP_SECRET=your_jwt_secret
    depends_on:
      - mongo
      - rabbitmq
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Check if token is expired or malformed
   - Verify that APP_SECRET is consistent
   - Ensure the user exists and is active

2. **Database Connection Issues**:
   - Check MongoDB connection string
   - Verify network connectivity
   - Use the `/test-db` endpoint to test connection

3. **Validation Errors**:
   - Check request payload against schema requirements
   - Look for missing required fields
   - Verify data types and formats

## Conclusion

The Customer Service is designed with scalability, resilience, and maintainability in mind. By following the patterns and practices outlined in this documentation, you can extend and enhance the service while maintaining its reliability.