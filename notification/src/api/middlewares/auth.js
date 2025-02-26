const { validateToken } = require('../../utils/token');
const { AuthenticationError, AuthorizationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('auth-middleware');

module.exports = async (req, res, next) => {
    try {
        const isAuth = req.get('Authorization');
        
        if (!isAuth) {
            throw new AuthenticationError('Authorization header is missing');
        }
        
        const token = isAuth.split(' ')[1];
        const payload = await validateToken(token);
        
        if (!payload) {
            throw new AuthenticationError('Invalid token');
        }
        
        req.user = payload;
        next();
    } catch (err) {
        logger.error(`Authentication error: ${err.message}`);
        next(err);
    }
}; 