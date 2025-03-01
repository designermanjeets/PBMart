# Admin Service

The Admin Service is responsible for platform administration, user management, and analytics dashboards in the B2B eCommerce platform.

## Features

- User management (create, update, delete admin users)
- Role-based access control
- Analytics dashboards
- System configuration
- Customer management
- Vendor management
- Product catalog management
- Order management

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `POST /api/admin/refresh-token` - Refresh authentication token

### Admin Users
- `GET /api/admin/users` - Get all admin users
- `GET /api/admin/users/:id` - Get admin user by ID
- `POST /api/admin/users` - Create new admin user
- `PUT /api/admin/users/:id` - Update admin user
- `DELETE /api/admin/users/:id` - Delete admin user

### Roles
- `GET /api/admin/roles` - Get all roles
- `GET /api/admin/roles/:id` - Get role by ID
- `POST /api/admin/roles` - Create new role
- `PUT /api/admin/roles/:id` - Update role
- `DELETE /api/admin/roles/:id` - Delete role

### Analytics
- `GET /api/admin/analytics/dashboard` - Get dashboard analytics
- `GET /api/admin/analytics/sales` - Get sales analytics
- `GET /api/admin/analytics/customers` - Get customer analytics
- `GET /api/admin/analytics/products` - Get product analytics
- `GET /api/admin/analytics/orders` - Get order analytics
- `GET /api/admin/reports` - Generate reports

### Customer Management
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/customers/:id` - Get customer by ID
- `PUT /api/admin/customers/:id` - Update customer
- `DELETE /api/admin/customers/:id` - Delete customer

## Frontend Integration

The Admin Service integrates with the frontend through the API Gateway. The frontend applications can access admin functionality through the following:

1. **Authentication**: Admin users can log in through the seller portal using the `/api/admin/login` endpoint.

2. **Dashboard**: The seller portal includes an admin dashboard for authorized users.

3. **User Management**: Admin users can manage other admin users and their permissions.

4. **Analytics**: The admin dashboard provides analytics visualizations using data from the analytics endpoints.

## Environment Variables

- `PORT` - Port number (default: 8005)
- `MONGODB_URI` - MongoDB connection string
- `APP_SECRET` - Secret for JWT token generation
- `MESSAGE_BROKER_URL` - RabbitMQ connection URL
- `EXCHANGE_NAME` - RabbitMQ exchange name
- `QUEUE_NAME` - RabbitMQ queue name
- `CUSTOMER_SERVICE` - Customer service host and port
- `SHOPPING_SERVICE` - Shopping service host and port
- `PRODUCT_SERVICE` - Product service host and port
- `MAX_ADMIN_USERS` - Maximum number of admin users in free version
- `ANALYTICS_RETENTION_DAYS` - Number of days to retain analytics data
- `ENABLE_ADVANCED_ANALYTICS` - Enable advanced analytics features 