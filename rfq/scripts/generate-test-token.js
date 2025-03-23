const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');

// Load environment variables
if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV || 'dev'}`;
    dotEnv.config({ path: configFile });
} else {
    dotEnv.config();
}

const APP_SECRET = process.env.APP_SECRET || 'xbusiness_secret';

// Create a test user payload
const testUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  role: 'customer'
};

// Sign the token with the correct APP_SECRET
const token = jwt.sign(testUser, APP_SECRET, { expiresIn: '1h' });

console.log('Test JWT Token:');
console.log(token); 