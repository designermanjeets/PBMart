const dotEnv = require('dotenv');

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'prod') {
    dotEnv.config({ path: './.env.prod' });
} else {
    dotEnv.config({ path: './.env.dev' });
}

module.exports = {
    PORT: process.env.PORT || 8010,
    APP_SECRET: process.env.APP_SECRET,
    DB_URL: process.env.MONGODB_URI,
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    QUEUE_NAME: process.env.QUEUE_NAME,
    STORAGE_TYPE: process.env.STORAGE_TYPE || 'local',
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    S3_CONFIG: {
        bucketName: process.env.S3_BUCKET_NAME,
        region: process.env.S3_REGION,
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY
    },
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
}; 