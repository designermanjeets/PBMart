const Joi = require('joi');

// Vendor registration schema
const vendorRegistrationSchema = Joi.object({
    businessName: Joi.string().required(),
    legalName: Joi.string().required(),
    businessType: Joi.string().valid('manufacturer', 'wholesaler', 'distributor', 'retailer').required(),
    taxId: Joi.string().required(),
    registrationNumber: Joi.string().required(),
    yearEstablished: Joi.number().integer().min(1800).max(new Date().getFullYear()),
    description: Joi.string(),
    contactPerson: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        position: Joi.string(),
        email: Joi.string().email().required(),
        phone: Joi.string().required()
    }).required(),
    businessAddress: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().required()
    }).required(),
    shippingAddress: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipCode: Joi.string(),
        country: Joi.string()
    }),
    bankInformation: Joi.object({
        accountName: Joi.string(),
        accountNumber: Joi.string(),
        bankName: Joi.string(),
        routingNumber: Joi.string(),
        swiftCode: Joi.string()
    }),
    paymentTerms: Joi.string(),
    minimumOrderValue: Joi.number().min(0),
    serviceableRegions: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    createdBy: Joi.string()
});

// Vendor update schema
const vendorUpdateSchema = Joi.object({
    businessName: Joi.string(),
    legalName: Joi.string(),
    businessType: Joi.string().valid('manufacturer', 'wholesaler', 'distributor', 'retailer'),
    yearEstablished: Joi.number().integer().min(1800).max(new Date().getFullYear()),
    description: Joi.string(),
    logo: Joi.string(),
    coverImage: Joi.string(),
    contactPerson: Joi.object({
        firstName: Joi.string(),
        lastName: Joi.string(),
        position: Joi.string(),
        email: Joi.string().email(),
        phone: Joi.string()
    }),
    businessAddress: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipCode: Joi.string(),
        country: Joi.string()
    }),
    shippingAddress: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipCode: Joi.string(),
        country: Joi.string()
    }),
    bankInformation: Joi.object({
        accountName: Joi.string(),
        accountNumber: Joi.string(),
        bankName: Joi.string(),
        routingNumber: Joi.string(),
        swiftCode: Joi.string()
    }),
    paymentTerms: Joi.string(),
    minimumOrderValue: Joi.number().min(0),
    serviceableRegions: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string())
});

// Vendor status update schema
const vendorStatusUpdateSchema = Joi.object({
    status: Joi.string().valid('pending', 'active', 'suspended', 'inactive').required()
});

// Vendor query schema
const vendorQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'active', 'suspended', 'inactive'),
    verificationStatus: Joi.string().valid('unverified', 'in_progress', 'verified', 'rejected'),
    businessType: Joi.string().valid('manufacturer', 'wholesaler', 'distributor', 'retailer'),
    category: Joi.string(),
    region: Joi.string(),
    search: Joi.string()
});

module.exports = {
    vendorRegistrationSchema,
    vendorUpdateSchema,
    vendorStatusUpdateSchema,
    vendorQuerySchema
}; 