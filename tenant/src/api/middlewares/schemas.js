const Joi = require('joi');

// Tenant validation schemas
const tenantSchema = {
    signup: Joi.object({
        name: Joi.string().required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty': 'Name is required',
                'any.required': 'Name is required'
            }),
        email: Joi.string().email().required()
            .messages({
                'string.base': 'Email must be a string',
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string().min(8).required()
            .messages({
                'string.base': 'Password must be a string',
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least {#limit} characters long',
                'any.required': 'Password is required'
            })
    }),
    
    signin: Joi.object({
        email: Joi.string().email().required()
            .messages({
                'string.base': 'Email must be a string',
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string().required()
            .messages({
                'string.base': 'Password must be a string',
                'string.empty': 'Password is required',
                'any.required': 'Password is required'
            })
    }),
    
    profile: Joi.object({
        name: Joi.string().required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty': 'Name is required',
                'any.required': 'Name is required'
            }),
        email: Joi.string().email().required()
            .messages({
                'string.base': 'Email must be a string',
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        phone: Joi.string().allow('').optional()
            .messages({
                'string.base': 'Phone must be a string'
            }),
        address: Joi.object({
            street: Joi.string().allow('').optional(),
            city: Joi.string().allow('').optional(),
            state: Joi.string().allow('').optional(),
            zip: Joi.string().allow('').optional(),
            country: Joi.string().allow('').optional()
        }).optional()
    }),
    
    settings: Joi.object({
        companyName: Joi.string().allow('').optional(),
        logo: Joi.string().allow('').optional(),
        theme: Joi.string().allow('').optional(),
        language: Joi.string().allow('').optional(),
        timezone: Joi.string().allow('').optional(),
        currency: Joi.string().allow('').optional(),
        notifications: Joi.object().optional()
    }),
    
    user: Joi.object({
        name: Joi.string().required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty': 'Name is required',
                'any.required': 'Name is required'
            }),
        email: Joi.string().email().required()
            .messages({
                'string.base': 'Email must be a string',
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        role: Joi.string().valid('admin', 'manager', 'user').required()
            .messages({
                'string.base': 'Role must be a string',
                'string.empty': 'Role is required',
                'any.only': 'Role must be one of: admin, manager, user',
                'any.required': 'Role is required'
            })
    }),
    
    params: Joi.object({
        id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
            .messages({
                'string.base': 'ID must be a string',
                'string.empty': 'ID is required',
                'string.pattern.base': 'ID must be a valid MongoDB ObjectId',
                'any.required': 'ID is required'
            })
    })
};

module.exports = {
    tenantSchema
}; 