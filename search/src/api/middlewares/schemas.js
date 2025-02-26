const Joi = require('joi');

// Search query schema
const searchQuerySchema = Joi.object({
    q: Joi.string().allow('').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('price', 'name', 'createdAt').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    category: Joi.string().optional(),
    brand: Joi.string().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    inStock: Joi.boolean().optional()
}).unknown(true);

// Suggestion query schema
const suggestQuerySchema = Joi.object({
    q: Joi.string().required(),
    limit: Joi.number().integer().min(1).max(20).default(5)
});

// Product index schema
const productIndexSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    category: Joi.string().required(),
    price: Joi.number().min(0).required(),
    brand: Joi.string().optional(),
    inStock: Joi.boolean().default(true),
    tags: Joi.array().items(Joi.string()).optional(),
    attributes: Joi.object().optional(),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now)
});

// Analytics schema
const analyticsSchema = Joi.object({
    userId: Joi.string().optional(),
    searchQuery: Joi.string().required(),
    sessionId: Joi.string().required(),
    clickedResults: Joi.array().items(Joi.string()).min(1).required()
});

module.exports = {
    searchSchema: {
        query: searchQuerySchema,
        suggest: suggestQuerySchema,
        index: productIndexSchema,
        analytics: analyticsSchema
    }
}; 