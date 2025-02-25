const Joi = require('joi');

// Customer validation schemas
const customerSchema = {
  signup: Joi.object({
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
      }),
    phone: Joi.string().pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).required()
      .messages({
        'string.base': 'Phone must be a string',
        'string.empty': 'Phone is required',
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone is required'
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
  
  address: Joi.object({
    street: Joi.string().required()
      .messages({
        'string.base': 'Street must be a string',
        'string.empty': 'Street is required',
        'any.required': 'Street is required'
      }),
    postalCode: Joi.string().required()
      .messages({
        'string.base': 'Postal code must be a string',
        'string.empty': 'Postal code is required',
        'any.required': 'Postal code is required'
      }),
    city: Joi.string().required()
      .messages({
        'string.base': 'City must be a string',
        'string.empty': 'City is required',
        'any.required': 'City is required'
      }),
    country: Joi.string().required()
      .messages({
        'string.base': 'Country must be a string',
        'string.empty': 'Country is required',
        'any.required': 'Country is required'
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
  customerSchema
}; 