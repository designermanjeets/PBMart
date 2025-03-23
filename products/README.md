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

- **URL**: `/api/products`
- **Method**: `GET`
- **Description**: Returns all products with categories
- **Response**:
  ```json
  {
    "products": [
      {
        "_id": "67daf8070da21fb4b034f81f",
        "name": "Wireless Headphones",
        "desc": "Premium noise-cancelling wireless headphones",
        "type": "electronics",
        "unit": 1,
        "price": 199.99,
        "available": true,
        "supplier": "AudioTech",
        "banner": "https://example.com/headphones.jpg"
      }
    ],
    "categories": ["electronics", "clothing", "furniture"]
  }
  ```

### Documentation Endpoint

- **URL**: `/api/products/docs`
- **Method**: `GET`
- **Description**: Returns API documentation
- **Response**: List of available endpoints

### Product Management

#### Create Product
- **URL**: `/api/products/create`
- **Method**: `POST`
- **Description**: Create a new product
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "name": "Wireless Headphones",
    "desc": "Premium noise-cancelling wireless headphones",
    "type": "electronics",
    "unit": 1,
    "price": 199.99,
    "available": true,
    "supplier": "AudioTech",
    "banner": "https://example.com/headphones.jpg"
  }
  ```
- **Notes**: 
  - `supplier` and `banner` fields are optional
  - If `banner` is not a valid URL, a default placeholder image will be used
- **Response**: Created product data

#### Get Product by ID
- **URL**: `/api/products/:id`
- **Method**: `GET`
- **Description**: Get a specific product by ID
- **Response**: Product data

#### Get Products by Category
- **URL**: `/api/products/category/:type`
- **Method**: `GET`
- **Description**: Get products by category type
- **Valid Categories**: `electronics`, `clothing`, `furniture`, `books`, `other`
- **Response**: List of products in the specified category

#### Get Products by IDs
- **URL**: `/api/products/ids`
- **Method**: `POST`
- **Description**: Get multiple products by their IDs
- **Request Body**:
  ```json
  {
    "ids": ["67daf8070da21fb4b034f81f", "67daf8070da21fb4b034f820"]
  }
  ```
- **Response**: List of products matching the provided IDs

### Wishlist Operations

#### Add to Wishlist
- **URL**: `/api/products/wishlist`
- **Method**: `PUT`
- **Description**: Add product to wishlist (sends event to Customer service)
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "_id": "67daf8070da21fb4b034f81f"
  }
  ```
- **Response**: Product that was added to wishlist

#### Remove from Wishlist
- **URL**: `/api/products/wishlist/:id`
- **Method**: `DELETE`
- **Description**: Remove product from wishlist (sends event to Customer service)
- **Authentication**: Required (JWT)
- **Response**: Product that was removed from wishlist

### Shopping Cart Operations

#### Add to Cart
- **URL**: `/api/products/cart`
- **Method**: `PUT`
- **Description**: Add product to cart (sends events to Customer and Shopping services)
- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "_id": "67daf8070da21fb4b034f81f",
    "qty": 2
  }
  ```
- **Response**: 
  ```json
  {
    "product": {
      "_id": "67daf8070da21fb4b034f81f",
      "name": "Wireless Headphones",
      "desc": "Premium noise-cancelling wireless headphones",
      "type": "electronics",
      "unit": 1,
      "price": 199.99,
      "available": true,
      "supplier": "AudioTech",
      "banner": "https://example.com/headphones.jpg"
    },
    "unit": 2
  }
  ```

#### Remove from Cart
- **URL**: `/api/products/cart/:id`
- **Method**: `DELETE`
- **Description**: Remove product from cart (sends events to Customer and Shopping services)
- **Authentication**: Required (JWT)
- **Response**: Product that was removed from cart

### Database Test

- **URL**: `/api/products/test-db`
- **Method**: `GET`
- **Description**: Test database connection
- **Response**: Database connection status

## Message Broker Integration

The Products Service communicates with other services using RabbitMQ:

### Publishing Messages

The service publishes messages for the following events:
- `CREATE_PRODUCT`: When a new product is created
- `ADD_TO_WISHLIST`: When a product is added to a wishlist
- `REMOVE_FROM_WISHLIST`: When a product is removed from a wishlist
- `ADD_TO_CART`: When a product is added to a cart
- `REMOVE_FROM_CART`: When a product is removed from a cart

### Subscribing to Messages

The service subscribes to events from the Customer Service to handle customer-related operations.

## Error Handling

The service implements a centralized error handling approach with custom error classes:

- `ValidationError`: For input validation errors
- `NotFoundError`: When a requested resource doesn't exist
- `DatabaseError`: For database operation failures
- `APIError`: For general API errors

Example error response:
```json
{
  "status": "error",
  "message": "Product not found with ID: 67daf8070da21fb4b034f81f"
}
```

## Validation

Input validation is implemented using Joi schemas for:
- Product creation and updates
- ID parameters
- Category parameters
- Cart operations
- Wishlist operations

## Database Schema

### Product Model

```javascript
const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  desc: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Product description cannot exceed 1000 characters']
  },
  banner: {
    type: String
    // Optional field
  },
  type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: {
      values: ['electronics', 'clothing', 'furniture', 'books', 'other'],
      message: 'Product type must be one of: electronics, clothing, furniture, books, other'
    }
  },
  unit: {
    type: Number,
    required: [true, 'Product unit is required'],
    min: [0, 'Product unit cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Product price cannot be negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  supplier: {
    type: String
    // Optional field
  }
}, {
  timestamps: true
});
```

## Best Practices

1. **Error Handling**: Use try-catch blocks in all async functions
2. **Validation**: Validate all input data before processing
3. **Logging**: Use appropriate log levels (info, warn, error)
4. **Default Values**: Provide sensible defaults for optional fields
5. **Testing**: Test all endpoints with valid and invalid inputs

## Example Usage

### Creating a Product

```javascript
// Request
fetch('http://localhost:8000/api/products/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    name: "Wireless Headphones",
    desc: "Premium noise-cancelling wireless headphones with 20-hour battery life",
    type: "electronics",
    unit: 1,
    price: 199.99,
    available: true,
    supplier: "AudioTech",
    banner: "https://example.com/headphones.jpg"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Adding to Cart

```javascript
// Request
fetch('http://localhost:8000/api/products/cart', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    _id: "67daf8070da21fb4b034f81f",
    qty: 2
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Troubleshooting

### Common Issues

1. **Validation Errors**:
   - Check request payload against schema requirements
   - Ensure all required fields are provided
   - Verify data types and formats
   - For banner URLs, ensure they are valid URLs or leave empty to use default

2. **Authentication Failures**:
   - Verify JWT token is valid and not expired
   - Check that the user has appropriate permissions

3. **Database Connection Issues**:
   - Use the `/api/products/test-db` endpoint to check connection
   - Verify MongoDB is running and accessible

## Environment Variables

The service uses the following environment variables:

- `APP_SECRET`: Secret key for JWT signing
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Service port (default: 8002)
- `MESSAGE_BROKER_URL`: RabbitMQ connection string
- `EXCHANGE_NAME`: RabbitMQ exchange name
- `QUEUE_NAME`: RabbitMQ queue name
- `NODE_ENV`: Environment (development/production)

## Conclusion

The Products Service is designed with scalability, resilience, and maintainability in mind. By following the patterns and practices outlined in this documentation, you can extend and enhance the service while maintaining its reliability.
