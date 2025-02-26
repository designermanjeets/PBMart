const Joi = require('joi');

// Notification schemas
const notificationSchema = {
    params: Joi.object({
        id: Joi.string().required()
    }),
    
    query: Joi.object({
        limit: Joi.number().integer().min(1).max(100),
        skip: Joi.number().integer().min(0),
        status: Joi.string().valid('pending', 'sent', 'failed', 'read'),
        type: Joi.string().valid('email', 'sms', 'inapp')
    }),
    
    email: Joi.object({
        email: Joi.string().email().required(),
        templateName: Joi.string().required(),
        data: Joi.object().required(),
        options: Joi.object({
            cc: Joi.alternatives().try(
                Joi.string().email(),
                Joi.array().items(Joi.string().email())
            ),
            bcc: Joi.alternatives().try(
                Joi.string().email(),
                Joi.array().items(Joi.string().email())
            ),
            attachments: Joi.array().items(
                Joi.object({
                    filename: Joi.string().required(),
                    content: Joi.alternatives().try(
                        Joi.string(),
                        Joi.binary()
                    ).required()
                })
            )
        })
    }),
    
    sms: Joi.object({
        phoneNumber: Joi.string().required(),
        templateName: Joi.string().required(),
        data: Joi.object().required(),
        options: Joi.object({
            from: Joi.string()
        })
    }),
    
    inapp: Joi.object({
        templateName: Joi.string().required(),
        data: Joi.object({
            title: Joi.string()
        }).unknown(true).required()
    })
};

// Template schemas
const templateSchema = {
    params: Joi.object({
        id: Joi.string().required()
    }),
    
    create: Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('email', 'sms', 'inapp').required(),
        subject: Joi.when('type', {
            is: 'email',
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '')
        }),
        content: Joi.string().required(),
        variables: Joi.array().items(Joi.string()),
        isActive: Joi.boolean()
    }),
    
    update: Joi.object({
        subject: Joi.string(),
        content: Joi.string(),
        variables: Joi.array().items(Joi.string()),
        isActive: Joi.boolean()
    })
};

module.exports = {
    notificationSchema,
    templateSchema
}; 