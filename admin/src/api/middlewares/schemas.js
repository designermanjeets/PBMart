const Joi = require('joi');

// Admin validation schemas
const adminSchema = {
  create: Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    roleId: Joi.string().required(),
    permissions: Joi.array().items(Joi.string())
  }),
  
  update: Joi.object({
    name: Joi.string().min(3).max(50),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    roleId: Joi.string(),
    permissions: Joi.array().items(Joi.string()),
    isActive: Joi.boolean()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

// Role validation schemas
const roleSchema = {
  create: Joi.object({
    name: Joi.string().required().min(3).max(50),
    description: Joi.string(),
    permissions: Joi.array().items(Joi.string()).required(),
    isDefault: Joi.boolean()
  }),
  
  update: Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string(),
    permissions: Joi.array().items(Joi.string()),
    isDefault: Joi.boolean()
  })
};

// Analytics validation schemas
const analyticsSchema = {
  query: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    groupBy: Joi.string().valid('day', 'week', 'month')
  })
};

module.exports = {
  adminSchema,
  roleSchema,
  analyticsSchema
}; 