const Joi = require('joi');

// Payment validation schemas
const paymentSchema = {
  process: Joi.object({
    orderId: Joi.string().required()
      .messages({
        'string.base': 'Order ID must be a string',
        'string.empty': 'Order ID is required',
        'any.required': 'Order ID is required'
      }),
    amount: Joi.number().positive().required()
      .messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
    currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD')
      .messages({
        'string.base': 'Currency must be a string',
        'any.only': 'Currency must be one of: USD, EUR, GBP'
      }),
    paymentMethod: Joi.string().valid('credit_card', 'paypal', 'bank_transfer').required()
      .messages({
        'string.base': 'Payment method must be a string',
        'string.empty': 'Payment method is required',
        'any.only': 'Payment method must be one of: credit_card, paypal, bank_transfer',
        'any.required': 'Payment method is required'
      }),
    description: Joi.string().allow('').optional()
      .messages({
        'string.base': 'Description must be a string'
      })
  }),
  
  invoice: Joi.object({
    paymentId: Joi.string().required()
      .messages({
        'string.base': 'Payment ID must be a string',
        'string.empty': 'Payment ID is required',
        'any.required': 'Payment ID is required'
      }),
    customerId: Joi.string().required()
      .messages({
        'string.base': 'Customer ID must be a string',
        'string.empty': 'Customer ID is required',
        'any.required': 'Customer ID is required'
      }),
    items: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().required()
      })
    ).min(1).required()
      .messages({
        'array.base': 'Items must be an array',
        'array.min': 'At least one item is required',
        'any.required': 'Items are required'
      })
  }),
  
  report: Joi.object({
    startDate: Joi.date().required()
      .messages({
        'date.base': 'Start date must be a valid date',
        'any.required': 'Start date is required'
      }),
    endDate: Joi.date().min(Joi.ref('startDate')).required()
      .messages({
        'date.base': 'End date must be a valid date',
        'date.min': 'End date must be after start date',
        'any.required': 'End date is required'
      }),
    type: Joi.string().valid('sales', 'revenue', 'transactions').required()
      .messages({
        'string.base': 'Report type must be a string',
        'any.only': 'Report type must be one of: sales, revenue, transactions',
        'any.required': 'Report type is required'
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
  paymentSchema
}; 