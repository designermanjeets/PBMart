const { ValidateSignature } = require('../../utils');
const logger = require('../../utils/logger');

module.exports = async (req, res, next) => {
    try {
        const isAuthorized = await ValidateSignature(req);

        if (isAuthorized) {
            return next();
        }
        
        logger.warn(`Unauthorized access attempt: ${req.method} ${req.originalUrl}`);
        return res.status(403).json({ message: 'Not Authorized' });
    } catch (err) {
        logger.error(`Auth error: ${err.message}`);
        return res.status(403).json({ message: 'Not Authorized' });
    }
};