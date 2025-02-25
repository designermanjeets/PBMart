# Admin Service

The Admin Service is responsible for platform administration, user management, and analytics dashboards in the B2B eCommerce platform.

## Features

### Platform Administration
- System configuration management
- Service health monitoring
- Feature flag management
- Audit logging

### User Management
- Role-based access control
- User creation, editing, and deactivation
- Permission management
- Bulk user operations

### Analytics Dashboard
- Sales performance metrics
- User activity tracking
- Inventory analytics
- Custom report generation

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Admin Users
- `POST /api/admin/users` - Create admin user
- `GET /api/admin/users` - Get all admin users
- `GET /api/admin/users/:id` - Get admin user by ID
- `PUT /api/admin/users/:id` - Update admin user
- `DELETE /api/admin/users/:id` - Delete admin user

### Roles
- `POST /api/admin/roles` - Create role
- `GET /api/admin/roles` - Get all roles

### Analytics
- `GET /api/admin/dashboard` - Get dashboard summary
- `GET /api/admin/analytics/sales` - Get sales analytics
- `GET /api/admin/analytics/users` - Get user analytics
- `GET /api/admin/analytics/inventory` - Get inventory analytics
- `POST /api/admin/reports/:type` - Generate report

### Customer Management
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/customers/:id` - Get customer by ID
- `PUT /api/admin/customers/:id` - Update customer
- `DELETE /api/admin/customers/:id` - Delete customer

## Open Source Limitations

The free version of the Admin Service includes the following limitations:

- Limited to 5 admin users
- Basic analytics with 30-day data retention
- Limited customization options for dashboards
- No API for external analytics integration

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB
- RabbitMQ

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the service: `npm start`

### Development
- Run in development mode: `npm run dev`
- Run tests: `npm test`

## Environment Variables
- `NODE_ENV` - Environment (dev, prod)
- `PORT` - Port to run the service on (default: 8004)
- `MONGODB_URI` - MongoDB connection string
- `APP_SECRET` - Secret for JWT token generation
- `MESSAGE_BROKER_URL` - RabbitMQ connection string
- `CUSTOMER_SERVICE` - Customer service host and port
- `SHOPPING_SERVICE` - Shopping service host and port
- `PRODUCT_SERVICE` - Product service host and port
- `MAX_ADMIN_USERS` - Maximum number of admin users in free version
- `ANALYTICS_RETENTION_DAYS` - Number of days to retain analytics data
- `ENABLE_ADVANCED_ANALYTICS` - Enable advanced analytics features 