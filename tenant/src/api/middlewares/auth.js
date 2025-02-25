const { ValidateSignature } = require('../../utils');
const { AuthenticationError } = require('../../utils/errors');

/**
 * Middleware to validate JWT token
 */
const validateToken = async (req, res, next) => {
    try {
        const isAuthorized = await ValidateSignature(req);
        
        if (isAuthorized) {
            return next();
        }
        
        throw new AuthenticationError('Not Authorized');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    validateToken
}; 