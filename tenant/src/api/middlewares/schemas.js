const Joi = require('joi');

const tenantSchema = {
    register: Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().pattern(/^[0-9+\-\s]+$/).required(),
        companyName: Joi.string().min(2).max(100).required(),
        businessType: Joi.string().required(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().required(),
            country: Joi.string().required()
        }).required()
    }),
    
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    
    updateProfile: Joi.object({
        name: Joi.string().min(3).max(50),
        phone: Joi.string().pattern(/^[0-9+\-\s]+$/),
        companyName: Joi.string().min(2).max(100),
        businessType: Joi.string(),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zipCode: Joi.string(),
            country: Joi.string()
        })
    })
};

module.exports = {
    tenantSchema
}; 