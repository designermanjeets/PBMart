# API Gateway - Technical Documentation

## Overview

The API Gateway serves as the entry point to our B2B eCommerce microservices platform. It handles routing, authentication, rate limiting, and request/response transformation. The gateway provides a unified interface for clients to interact with the various microservices.

## Architecture

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet
- **Logging**: Winston, Morgan
- **Circuit Breaker**: Custom implementation

### Key Components

1. **Routing**: Routes requests to appropriate microservices
2. **Authentication**: Verifies JWT tokens and adds user information to requests
3. **Rate Limiting**: Prevents abuse by limiting request rates
4. **Circuit Breaker**: Prevents cascading failures by detecting service failures
5. **Logging**: Provides detailed logs for monitoring and debugging

## API Endpoints

### Gateway Health

- **URL**: `/api/health`
- **Method**: `GET`
- **Description**: Check the health of the API Gateway
- **Authentication**: Not required

### Products Service

- **URL**: `/api/products/*`
- **Description**: Routes to the Products service
- **Authentication**: Required for some endpoints

### Customer Service

- **URL**: `/api/customers/*`
- **Description**: Routes to the Customer service
- **Authentication**: Required for most endpoints

### Shopping Service

- **URL**: `/api/shopping/*`
- **Description**: Routes to the Shopping service
- **Authentication**: Required for most endpoints

### Tenant Service

- **URL**: `/api/tenants/*`
- **Description**: Routes to the Tenant service
- **Authentication**: Required for most endpoints

## Configuration

The gateway uses the following environment variables:

- `PORT`: Gateway port (default: 8000)
- `APP_SECRET`: Secret key for JWT verification
- `CUSTOMER_SERVICE_URL`: URL of the Customer service
- `PRODUCT_SERVICE_URL`: URL of the Products service
- `SHOPPING_SERVICE_URL`: URL of the Shopping service
- `TENANT_SERVICE_URL`: URL of the Tenant service
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX`: Maximum requests per window
- `LOG_LEVEL`: Logging level

## Deployment

### Docker

```
# Build the image
docker build -t gateway .

# Run the container
docker run -p 8000:8000 gateway
```

### Docker Compose

```
# Start the gateway with other services
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Verify JWT token is properly formatted
   - Check if token is expired
   - Ensure APP_SECRET is consistent

2. **Service Unavailable**:
   - Check if the target service is running
   - Verify network connectivity
   - Check the service's health endpoint

3. **Rate Limiting**:
   - If you're getting 429 responses, you're exceeding the rate limit
   - Adjust your request rate or contact the administrator

### Monitoring

- Use the `/api/health` endpoint to check gateway health
- Monitor logs in the `logs/` directory
- Set up alerts for error-level log entries

## Best Practices

1. **Error Handling**: Always check for error responses
2. **Authentication**: Include the JWT token in the Authorization header
3. **Rate Limiting**: Implement backoff strategies for rate limit errors
4. **Caching**: Consider caching responses for frequently accessed data 