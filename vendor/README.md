# Vendor Service

This service manages vendors for the B2B eCommerce platform.

## Features

- Vendor registration and management
- Vendor verification process
- Performance metrics tracking
- Document management

## API Endpoints

### Vendor Management

- `POST /api/vendors` - Register a new vendor
- `GET /api/vendors` - List all vendors (with filtering and pagination)
- `GET /api/vendors/:id` - Get vendor details
- `PUT /api/vendors/:id` - Update vendor information
- `PATCH /api/vendors/:id/status` - Update vendor status
- `DELETE /api/vendors/:id` - Delete a vendor (soft delete)
- `GET /api/vendors/:id/performance` - Get vendor performance metrics
- `POST /api/vendors/:id/performance/calculate` - Trigger performance calculation

### Verification

- `GET /api/verifications/:id` - Get verification details
- `GET /api/verifications/vendor/:vendorId` - Get verification by vendor
- `PATCH /api/verifications/:id/status` - Update verification status
- `POST /api/verifications/vendor/:vendorId/documents` - Upload verification documents
- `DELETE /api/verifications/:verificationId/documents/:documentId` - Delete a document

## Environment Variables

- `PORT` - Port number (default: 8010)
- `APP_SECRET` - Secret key for JWT
- `MONGODB_URI` - MongoDB connection string
- `MESSAGE_BROKER_URL` - RabbitMQ connection string
- `EXCHANGE_NAME` - RabbitMQ exchange name
- `QUEUE_NAME` - RabbitMQ queue name
- `STORAGE_TYPE` - File storage type (local or s3)
- `UPLOAD_DIR` - Local upload directory (for local storage)
- `S3_BUCKET_NAME` - S3 bucket name (for S3 storage)
- `S3_REGION` - S3 region (for S3 storage)
- `S3_ACCESS_KEY` - S3 access key (for S3 storage)
- `S3_SECRET_KEY` - S3 secret key (for S3 storage)
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

## Running the Service

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker

```bash
docker build -t vendor-service .
docker run -p 8010:8010 vendor-service
``` 