const validateToken = async (req, res, next) => {
  try {
    console.log('Request headers:', req.headers);
    console.log('Request path:', req.path);
    
    // For testing purposes, let's allow requests without a token
    // Remove this in production
    return next();
    
    // Rest of your validation code...
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(403).json({ message: 'Failed to authenticate user' });
  }
};

module.exports = {
  validateToken
}; 