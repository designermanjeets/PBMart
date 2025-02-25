const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../config');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
  try {
    // Get the authorization header
    const authorization = req.headers.authorization;
    
    if (!authorization) {
      return res.status(401).json({ message: 'Authorization header is required' });
    }
    
    // Extract the token
    const token = authorization.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, APP_SECRET);
    
    // Add the user to the request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 