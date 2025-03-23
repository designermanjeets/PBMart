const Joi = require('joi');

// Product validation schemas
const productSchema = {
  create: Joi.object({
    name: Joi.string().trim().min(3).max(100).required()
      .messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least {#limit} characters long',
        'string.max': 'Name cannot exceed {#limit} characters',
        'any.required': 'Name is required'
      }),
    desc: Joi.string().trim().min(10).max(1000).required()
      .messages({
        'string.base': 'Description must be a string',
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least {#limit} characters long',
        'string.max': 'Description cannot exceed {#limit} characters',
        'any.required': 'Description is required'
      }),
    type: Joi.string().valid('electronics', 'clothing', 'furniture', 'books', 'other').required()
      .messages({
        'string.base': 'Type must be a string',
        'string.empty': 'Type is required',
        'any.only': 'Type must be one of: electronics, clothing, furniture, books, other',
        'any.required': 'Type is required'
      }),
    unit: Joi.number().integer().min(0).required()
      .messages({
        'number.base': 'Unit must be a number',
        'number.integer': 'Unit must be an integer',
        'number.min': 'Unit cannot be negative',
        'any.required': 'Unit is required'
      }),
    price: Joi.number().precision(2).min(0).required()
      .messages({
        'number.base': 'Price must be a number',
        'number.precision': 'Price cannot have more than 2 decimal places',
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required'
      }),
    available: Joi.boolean().default(true)
      .messages({
        'boolean.base': 'Available must be a boolean'
      }),
    supplier: Joi.string().trim().optional()
      .messages({
        'string.base': 'Supplier must be a string'
      }),
    banner: Joi.string().optional().allow('')
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(3).max(100)
      .messages({
        'string.base': 'Name must be a string',
        'string.min': 'Name must be at least {#limit} characters long',
        'string.max': 'Name cannot exceed {#limit} characters'
      }),
    desc: Joi.string().trim().min(10).max(1000)
      .messages({
        'string.base': 'Description must be a string',
        'string.min': 'Description must be at least {#limit} characters long',
        'string.max': 'Description cannot exceed {#limit} characters'
      }),
    type: Joi.string().valid('electronics', 'clothing', 'furniture', 'books', 'other')
      .messages({
        'string.base': 'Type must be a string',
        'any.only': 'Type must be one of: electronics, clothing, furniture, books, other'
      }),
    unit: Joi.number().integer().min(0)
      .messages({
        'number.base': 'Unit must be a number',
        'number.integer': 'Unit must be an integer',
        'number.min': 'Unit cannot be negative'
      }),
    price: Joi.number().precision(2).min(0)
      .messages({
        'number.base': 'Price must be a number',
        'number.precision': 'Price cannot have more than 2 decimal places',
        'number.min': 'Price cannot be negative'
      }),
    available: Joi.boolean()
      .messages({
        'boolean.base': 'Available must be a boolean'
      }),
    supplier: Joi.string().trim()
      .messages({
        'string.base': 'Supplier must be a string'
      }),
    banner: Joi.string().uri()
      .messages({
        'string.base': 'Banner must be a string',
        'string.uri': 'Banner must be a valid URL'
      })
  }),
  
  params: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.base': 'ID must be a string',
        'string.pattern.base': 'ID must be a valid MongoDB ObjectId'
      }),
    _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.base': 'ID must be a string',
        'string.pattern.base': 'ID must be a valid MongoDB ObjectId'
      })
  })
  .or('id', '_id')
  .messages({
    'object.missing': 'Either id or _id is required'
  }),
  
  category: Joi.object({
    type: Joi.string().valid('electronics', 'clothing', 'furniture', 'books', 'other').required()
      .messages({
        'string.base': 'Type must be a string',
        'string.empty': 'Type is required',
        'any.only': 'Type must be one of: electronics, clothing, furniture, books, other',
        'any.required': 'Type is required'
      })
  }),
  
  ids: Joi.object({
    ids: Joi.array().items(
      Joi.string().regex(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.base': 'ID must be a string',
          'string.pattern.base': 'ID must be a valid MongoDB ObjectId'
        })
    ).min(1).required()
      .messages({
        'array.base': 'IDs must be an array',
        'array.min': 'At least one ID is required',
        'any.required': 'IDs are required'
      })
  }),
  
  cart: Joi.object({
    _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
      .messages({
        'string.base': 'Product ID must be a string',
        'string.empty': 'Product ID is required',
        'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
        'any.required': 'Product ID is required'
      }),
    qty: Joi.number().integer().min(1).required()
      .messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
      })
  }),
  
  wishlist: Joi.object({
    _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
      .messages({
        'string.base': 'Product ID must be a string',
        'string.empty': 'Product ID is required',
        'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
        'any.required': 'Product ID is required'
      })
  })
};

module.exports = {
  productSchema
}; 