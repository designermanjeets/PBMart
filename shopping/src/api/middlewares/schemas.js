const Joi = require('joi');

// Shopping validation schemas
const shoppingSchema = {
  cart: Joi.object({
    product_id: Joi.string().required()
      .messages({
        'string.base': 'Product ID must be a string',
        'string.empty': 'Product ID cannot be empty',
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
    product_id: Joi.string().required()
      .messages({
        'string.base': 'Product ID must be a string',
        'string.empty': 'Product ID cannot be empty',
        'any.required': 'Product ID is required'
      })
  }),
  
  order: Joi.object({
    txnId: Joi.string().required()
      .messages({
        'string.base': 'Transaction ID must be a string',
        'string.empty': 'Transaction ID cannot be empty',
        'any.required': 'Transaction ID is required'
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
  shoppingSchema
}; 