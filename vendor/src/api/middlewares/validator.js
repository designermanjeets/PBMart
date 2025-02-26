const Joi = require('joi');
const { ValidationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('validator-middleware');

const validateSchema = (schema, property) => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });
        
        if (!error) {
            next();
        } else {
            const errors = error.details.reduce((acc, curr) => {
                acc[curr.path[0]] = curr.message;
                return acc;
            }, {});
            
            logger.debug('Validation error', { errors });
            next(new ValidationError('Validation error', errors));
        }
    };
};

module.exports = {
    validateSchema
}; 