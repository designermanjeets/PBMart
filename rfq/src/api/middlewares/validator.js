const { ValidationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('validator-middleware');

module.exports = {
    validateBody: (schema) => {
        return (req, res, next) => {
            try {
                const { error } = schema.validate(req.body);
                
                if (error) {
                    const errorMessage = error.details.map(detail => detail.message).join(', ');
                    throw new ValidationError(`Invalid request body: ${errorMessage}`);
                }
                
                next();
            } catch (err) {
                logger.error(`Validation error: ${err.message}`);
                next(err);
            }
        };
    },
    
    validateParams: (schema) => {
        return (req, res, next) => {
            try {
                const { error } = schema.validate(req.params);
                
                if (error) {
                    const errorMessage = error.details.map(detail => detail.message).join(', ');
                    throw new ValidationError(`Invalid request parameters: ${errorMessage}`);
                }
                
                next();
            } catch (err) {
                logger.error(`Validation error: ${err.message}`);
                next(err);
            }
        };
    },
    
    validateQuery: (schema) => {
        return (req, res, next) => {
            try {
                const { error } = schema.validate(req.query);
                
                if (error) {
                    const errorMessage = error.details.map(detail => detail.message).join(', ');
                    throw new ValidationError(`Invalid query parameters: ${errorMessage}`);
                }
                
                next();
            } catch (err) {
                logger.error(`Validation error: ${err.message}`);
                next(err);
            }
        };
    }
}; 