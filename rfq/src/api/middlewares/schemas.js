const Joi = require('joi');

const rfqSchema = {
    create: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        category: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        budget: Joi.number().min(0),
        deadline: Joi.date().iso().min('now').required(),
        requirements: Joi.array().items(Joi.string()),
        attachments: Joi.array().items(Joi.string().uri()),
        status: Joi.string().valid('draft', 'published', 'closed', 'awarded', 'cancelled').default('draft')
    }),
    
    update: Joi.object({
        title: Joi.string(),
        description: Joi.string(),
        category: Joi.string(),
        quantity: Joi.number().integer().min(1),
        budget: Joi.number().min(0),
        deadline: Joi.date().iso().min('now'),
        requirements: Joi.array().items(Joi.string()),
        attachments: Joi.array().items(Joi.string().uri()),
        status: Joi.string().valid('draft', 'published', 'closed', 'awarded', 'cancelled')
    }),
    
    params: Joi.object({
        id: Joi.string().required()
    }),
    
    quote: Joi.object({
        price: Joi.number().min(0).required(),
        deliveryTime: Joi.date().iso().min('now').required(),
        description: Joi.string().required(),
        attachments: Joi.array().items(Joi.string().uri())
    })
};

module.exports = {
    rfqSchema
}; 