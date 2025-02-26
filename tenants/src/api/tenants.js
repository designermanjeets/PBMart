const express = require('express');
const TenantService = require('../services/tenant-service');
const { PublishMessage, SubscribeMessage } = require('../utils');
const validateToken = require('./middlewares/auth');
const { validateRequest } = require('./middlewares/validator');
const { tenantSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

module.exports = (app, channel) => {
    const router = express.Router();
    const service = new TenantService();
    
    // If channel is available, subscribe to events
    if (channel) {
        SubscribeMessage(channel, service);
    } else {
        logger.warn("Message broker channel not available. Event subscription skipped.");
    }

    // Root endpoint
    router.get('/', (req, res) => {
        res.json({
            message: 'Tenants service API',
            version: '1.0.0'
        });
    });

    // Signup
    router.post('/signup', validateRequest(tenantSchema.signup), async (req, res, next) => {
        try {
            const { name, email, password } = req.body;
            const { data } = await service.SignUp({ name, email, password });
            res.status(201).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Login
    router.post('/login', validateRequest(tenantSchema.signin), async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const { data } = await service.SignIn({ email, password });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get profile
    router.get('/profile', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetProfile({ _id });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Update profile
    router.put('/profile', validateToken, validateRequest(tenantSchema.profile), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { name, email, phone, address } = req.body;
            const { data } = await service.UpdateProfile(_id, { name, email, phone, address });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get settings
    router.get('/settings', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetSettings({ _id });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Update settings
    router.put('/settings', validateToken, validateRequest(tenantSchema.settings), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.UpdateSettings(_id, req.body);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get users
    router.get('/users', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetUsers({ tenantId: _id });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Add user
    router.post('/users', validateToken, validateRequest(tenantSchema.user), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { name, email, role } = req.body;
            const { data } = await service.AddUser(_id, { name, email, role });
            res.status(201).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get user by ID
    router.get('/users/:id', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const userId = req.params.id;
            const { data } = await service.GetUserById(_id, userId);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Update user
    router.put('/users/:id', validateToken, validateRequest(tenantSchema.user), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const userId = req.params.id;
            const { name, email, role } = req.body;
            const { data } = await service.UpdateUser(_id, userId, { name, email, role });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Delete user
    router.delete('/users/:id', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const userId = req.params.id;
            const { data } = await service.RemoveUser(_id, userId);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    return router;
}; 