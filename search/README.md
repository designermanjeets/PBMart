# Search Service

## Overview

The Search Service is a critical component of the B2B eCommerce platform, providing powerful search capabilities for products. It leverages Elasticsearch for fast, scalable, and accurate full-text search functionality, along with MongoDB for storing search analytics data.

## Features

- **Full-text Search**: Search across product names, descriptions, and other attributes
- **Faceted Search**: Filter results by category, price range, brand, and other attributes
- **Autocomplete/Suggestions**: Get real-time search suggestions as users type
- **Analytics**: Track search queries and user interactions for insights
- **Real-time Indexing**: Automatically index products via message broker events

## Architecture

The Search Service follows a microservice architecture and integrates with:

- **Elasticsearch**: For storing and searching product data
- **MongoDB**: For storing search analytics (optional)
- **RabbitMQ**: For receiving product events (create, update, delete)
- **API Gateway**: For handling client requests

## API Endpoints

### Search Operations

- `GET /api/search`: Search for products
  - Query parameters:
    - `q`: Search query
    - `page`: Page number (default: 1)
    - `limit`: Results per page (default: 10)
    - `sortBy`: Field to sort by (price, name, createdAt)
    - `sortOrder`: Sort direction (asc, desc)
    - Additional filter parameters (category, brand, minPrice, maxPrice, inStock)

- `GET /api/search/suggest`: Get search suggestions
  - Query parameters:
    - `q`: Partial search query
    - `limit`: Maximum number of suggestions (default: 5)

- `GET /api/search/filters/:field`: Get available filter values for a field
  - Path parameters:
    - `field`: Field name (e.g., category, brand)

### Indexing Operations (Protected)

- `POST /api/search/index`: Index a single product
  - Requires authentication
  - Body: Product object

- `DELETE /api/search/index/:id`: Delete a product from the index
  - Requires authentication
  - Path parameters:
    - `id`: Product ID

- `POST /api/search/index/bulk`: Bulk index multiple products
  - Requires authentication
  - Body: Array of product objects

### Analytics Operations

- `GET /api/search/analytics`: Get search analytics
  - Requires authentication
  - Query parameters:
    - `startDate`: Start date for analytics
    - `endDate`: End date for analytics

- `POST /api/search/track/search`: Track a search query
  - Body:
    - `searchQuery`: The search query
    - `sessionId`: User session ID
    - `userId`: User ID (optional)

- `POST /api/search/track/click`: Track a product click
  - Body:
    - `searchQuery`: The search query
    - `sessionId`: User session ID
    - `clickedResults`: Array of clicked product IDs
    - `userId`: User ID (optional)

### Monitoring

- `GET /api/search/health`: Get service health status

## Configuration

The service can be configured using environment variables:
