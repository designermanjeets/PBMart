const express = require('express');
const { SHOPPING_SERVICE } = require('../config');
const CustomerService = require('../services/customer-service');
const { PublishMessage, SubscribeMessage } = require('../utils');
const validateToken = require('./middlewares/auth');
const { validateRequest } = require('./middlewares/validator');
const { customerSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

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

    // Add new address
    router.post('/address', validateToken, validateRequest(customerSchema.address), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { street, postalCode, city, country } = req.body;
            const { data } = await service.AddNewAddress(_id, {
                street,
                postalCode,
                city,
                country
            });
            res.status(201).json(data);
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

    // Add to wishlist
    router.post('/wishlist', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { product } = req.body;
            const { data } = await service.AddToWishlist(_id, product);
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
            const { data } = await service.ManageCart(_id, { _id: product_id }, qty, false);
            
            // Publish event to shopping service if channel exists
            if (channel) {
                PublishMessage(channel, SHOPPING_SERVICE, {
                    event: 'ADD_TO_CART',
                    data: { userId: _id, product: { _id: product_id }, qty }
                });
            }
            
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get cart
    router.get('/cart', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetShoppingDetails(_id);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Delete cart item
    router.delete('/cart/:id', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const productId = req.params.id;
            const { data } = await service.ManageCart(_id, { _id: productId }, 0, true);
            
            // Publish event to shopping service if channel exists
            if (channel) {
                PublishMessage(channel, SHOPPING_SERVICE, {
                    event: 'REMOVE_FROM_CART',
                    data: { userId: _id, product: { _id: productId } }
                });
            }
            
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

    return router;
};
