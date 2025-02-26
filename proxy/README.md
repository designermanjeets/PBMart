 # API Gateway Proxy Service

## Overview
The API Gateway Proxy Service acts as the entry point for all client requests to the B2B E-commerce platform's microservices. It handles routing, load balancing, and provides a unified interface for the frontend to communicate with the backend services.

## Features
- **Request Routing**: Direct requests to appropriate microservices
- **Load Balancing**: Distribute traffic across service instances
- **Response Caching**: Cache responses to improve performance
- **Request/Response Transformation**: Modify requests and responses as needed
- **Error Handling**: Provide consistent error responses
- **Static File Serving**: Serve static files for reports and invoices
- **WebSocket Support**: Handle WebSocket connections for real-time features

## Architecture
The service is built using Nginx, a high-performance web server and reverse proxy:
- **Upstream Definitions**: Define backend service locations
- **Location Blocks**: Configure routing rules
- **Proxy Settings**: Set up proxy behavior and headers
- **Error Handling**: Configure error responses
- **Static File Serving**: Configure static file locations

## Technical Stack
- Nginx
- Docker for containerization

## Routing Configuration

The proxy routes requests to the following services:
- **Customers Service**: `/api/customers/*`
- **Products Service**: `/api/products/*`
- **Shopping Service**: `/api/shopping/*`
- **Tenants Service**: `/api/tenants/*`
- **Admin Service**: `/api/admin/*`
- **Payment Service**: `/api/payment/*`
- **Notification Service**: `/api/notification/*`

Special routes:
- **Static Files**: `/reports/*` and `/invoices/*`
- **WebSockets**: `/socket.io/*` for real-time notifications

## Configuration
Configuration is managed through the `nginx.conf` file, which defines:
- Upstream server definitions
- Location-based routing rules
- Proxy settings and headers
- Error handling
- Static file serving
- WebSocket handling

## Development

### Prerequisites
- Nginx
- Docker and Docker Compose

### Setup
1. Clone the repository
2. Modify `nginx.conf` as needed
3. Build the Docker image: `docker build -t proxy .`
4. Run the container: `docker run -p 80:80 proxy`

### Testing
Test the proxy by sending requests to the configured endpoints and verifying that they are correctly routed to the appropriate services.

## Adding a New Service
To add a new service to the proxy:

1. Add an upstream definition in `nginx.conf`:
```nginx
upstream new_service {
    server new-service:port;
}
```

2. Add a location block for routing:
```nginx
location /api/new-service {
    proxy_pass http://new_service;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

3. Update the Docker Compose file to include the new service as a dependency

## Future Enhancements
1. **SSL Termination**: Add HTTPS support with SSL certificate management
2. **Rate Limiting**: Implement request rate limiting to prevent abuse
3. **Authentication Middleware**: Add centralized authentication
4. **Request Logging**: Enhanced logging for debugging and analytics
5. **API Documentation**: Serve Swagger/OpenAPI documentation
6. **Circuit Breaking**: Implement circuit breaking for failing services
7. **Request Tracing**: Add distributed tracing for request flows
8. **Caching Layer**: Implement response caching for improved performance
9. **API Versioning**: Support for multiple API versions
10. **Geographic Routing**: Route requests based on geographic location

## Troubleshooting
- Check Nginx logs for detailed error messages
- Verify that all backend services are running
- Check network connectivity between the proxy and services
- Verify that the proxy container is on the same Docker network as the services
- Check for configuration syntax errors in nginx.conf