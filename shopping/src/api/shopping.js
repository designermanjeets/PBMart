const express = require('express');
const { CUSTOMER_SERVICE, PRODUCT_SERVICE } = require('../config');
const ShoppingService = require('../services/shopping-service');
const { PublishMessage, SubscribeMessage } = require('../utils');
const validateToken = require('./middlewares/auth');
const { validateRequest } = require('./middlewares/validator');
const { shoppingSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

module.exports = (app, channel) => {
    const router = express.Router();
    const service = new ShoppingService();
    
    // If channel is available, subscribe to events
    if (channel) {
        SubscribeMessage(channel, service);
    } else {
        logger.warn("Message broker channel not available. Event subscription skipped.");
    }

    // Root endpoint
    router.get('/', (req, res) => {
        res.json({
            message: 'Shopping service API',
            version: '1.0.0'
        });
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

    // Add to cart
    router.post('/cart', validateToken, validateRequest(shoppingSchema.cart), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { product_id, qty } = req.body;
            
            // Get product details from product service
            const { data: product } = await service.GetProductById(product_id);
            
            if (!product) {
                throw new NotFoundError(`Product with ID ${product_id} not found`);
            }
            
            const { data } = await service.AddToCart({ _id, product, qty });
            
            // Publish event to customer service if channel exists
            if (channel) {
                PublishMessage(channel, CUSTOMER_SERVICE, {
                    event: 'ADD_TO_CART',
                    data: { userId: _id, product, qty }
                });
            }
            
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
            
            const { data } = await service.RemoveFromCart({ _id, productId });
            
            // Publish event to customer service if channel exists
            if (channel) {
                PublishMessage(channel, CUSTOMER_SERVICE, {
                    event: 'REMOVE_FROM_CART',
                    data: { userId: _id, product: { _id: productId } }
                });
            }
            
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get wishlist
    router.get('/wishlist', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetWishlist({ _id });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Add to wishlist
    router.post('/wishlist', validateToken, validateRequest(shoppingSchema.wishlist), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { product_id } = req.body;
            
            // Get product details from product service
            const { data: product } = await service.GetProductById(product_id);
            
            if (!product) {
                throw new NotFoundError(`Product with ID ${product_id} not found`);
            }
            
            const { data } = await service.AddToWishlist({ _id, product });
            
            // Publish event to customer service if channel exists
            if (channel) {
                PublishMessage(channel, CUSTOMER_SERVICE, {
                    event: 'ADD_TO_WISHLIST',
                    data: { userId: _id, product }
                });
            }
            
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
            
            const { data } = await service.RemoveFromWishlist({ _id, productId });
            
            // Publish event to customer service if channel exists
            if (channel) {
                PublishMessage(channel, CUSTOMER_SERVICE, {
                    event: 'REMOVE_FROM_WISHLIST',
                    data: { userId: _id, product: { _id: productId } }
                });
            }
            
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Create order
    router.post('/orders', validateToken, validateRequest(shoppingSchema.order), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { txnId } = req.body;
            
            const { data } = await service.CreateOrder({ _id, txnId });
            
            // Publish event to customer service if channel exists
            if (channel) {
                PublishMessage(channel, CUSTOMER_SERVICE, {
                    event: 'CREATE_ORDER',
                    data: { userId: _id, order: data }
                });
            }
            
            res.status(201).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get orders
    router.get('/orders', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await service.GetOrders({ _id });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get order by ID
    router.get('/orders/:id', validateToken, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const orderId = req.params.id;
            
            const { data } = await service.GetOrderById({ _id, orderId });
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    return router;
};
