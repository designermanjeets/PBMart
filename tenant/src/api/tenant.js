const express = require('express');
const TenantService = require('../services/tenant-service');
// Temporarily comment out these imports until we create the files
// const { validateToken } = require('./middlewares/auth');
// const { validateRequest } = require('./middlewares/validator');
// const { tenantSchema } = require('./middlewares/schemas');
const logger = require('../utils/logger');

module.exports = (channel) => {
    const router = express.Router();
    const service = new TenantService(channel);

    // Root endpoint
    router.get('/', (req, res) => {
        res.json({
            service: 'Tenant Service',
            version: '1.0.0',
            endpoints: [
                '/api/tenant/register',
                '/api/tenant/login',
                '/api/tenant/profile',
                '/api/tenant/products',
                '/api/tenant/orders',
                '/api/tenant/settings',
                '/api/tenant/support',
                '/api/tenant/health'
            ]
        });
    });

    // Simplified endpoints without validation for now
    router.post('/register', async (req, res, next) => {
        try {
            const { data } = await service.registerTenant(req.body);
            res.status(201).json(data || { message: 'Tenant registration endpoint (to be implemented)' });
        } catch (err) {
            next(err);
        }
    });

    router.post('/login', async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const { data } = await service.loginTenant({ email, password });
            res.status(200).json(data || { message: 'Tenant login endpoint (to be implemented)' });
        } catch (err) {
            next(err);
        }
    });

    router.get('/profile', async (req, res, next) => {
        try {
            res.status(200).json({ message: 'Tenant profile endpoint (to be implemented)' });
        } catch (err) {
            next(err);
        }
    });

    router.put('/profile', async (req, res, next) => {
        try {
            res.status(200).json({ message: 'Update tenant profile endpoint (to be implemented)' });
        } catch (err) {
            next(err);
        }
    });

    return router;
}; 