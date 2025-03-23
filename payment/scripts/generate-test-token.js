const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../src/config');

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