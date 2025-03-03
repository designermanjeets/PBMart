const express = require('express');
const { SHOPPING_SERVICE } = require('../config');
const CustomerService = require('../services/customer-service');
const { PublishMessage, SubscribeMessage } = require('../utils');
const validateToken = require('./middlewares/auth');
const { validateRequest } = require('./middlewares/validator');
const { customerSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

module.exports = (app, channel) => {
    const router = express.Router();
    const service = new CustomerService();
    
    // If channel is available, subscribe to events
    if (channel) {
        SubscribeMessage(channel, service);
    } else {
        logger.warn("Message broker channel not available. Event subscription skipped.");
    }

    // Root endpoint
    router.get('/', (req, res) => {
        res.json({
            message: 'Customer service API',
            version: '1.0.0'
        });
    });

    // Signup
    router.post('/signup', validateRequest(customerSchema.signup), async (req, res, next) => {
        try {
            const { email, password, phone } = req.body;
            const { data } = await service.SignUp({ email, password, phone });
            res.status(201).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Login
    router.post('/login', validateRequest(customerSchema.signin), async (req, res, next) => {
        console.log("Login request received");
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
    router.put('/profile', validateToken, validateRequest(customerSchema.profile), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { name, email, phone, address } = req.body;
            const { data } = await service.UpdateProfile(_id, { name, email, phone, address });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Add to wishlist
    router.post('/wishlist', validateToken, validateRequest(customerSchema.wishlist), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { product_id } = req.body;
            const { data } = await service.AddToWishlist(_id, product_id);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get wishlist
    router.get('/wishlist', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetWishlist(_id);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Remove from wishlist
    router.delete('/wishlist/:id', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const productId = req.params.id;
            const { data } = await service.RemoveFromWishlist(_id, productId);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Add to cart
    router.post('/cart', validateToken, validateRequest(customerSchema.cart), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { product_id, qty } = req.body;
            const { data } = await service.AddToCart(_id, { product_id, qty });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get cart
    router.get('/cart', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetCart({ _id });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Remove from cart
    router.delete('/cart/:id', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const productId = req.params.id;
            const { data } = await service.RemoveFromCart(_id, productId);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get orders
    router.get('/orders', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetShoppingDetails(_id);
            res.status(200).json(data.orders || []);
        } catch (err) {
            next(err);
        }
    });

    // Add a test endpoint
    router.get('/test-db', async (req, res) => {
        try {
            // Get the customer model
            const CustomerModel = require('../database/models/Customer');
            // Count documents
            const count = await CustomerModel.countDocuments();
            // Return the result
            res.json({ 
                message: 'Database connection test', 
                databaseName: mongoose.connection.name,
                count,
                connected: mongoose.connection.readyState === 1
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
