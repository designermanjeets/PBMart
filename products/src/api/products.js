const express = require('express');
const { CUSTOMER_SERVICE, SHOPPING_SERVICE } = require("../config");
const ProductService = require("../services/product-service");
const { publishMessage, subscribeMessage } = require('../utils/message-broker');
const UserAuth = require("./middlewares/auth");
const { validateBody, validateParams, validateQuery } = require('./middlewares/validator');
const { productSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError } = require('../utils/errors');
const mongoose = require("mongoose");
const { createLogger } = require('../utils/logger');
const logger = createLogger('products-api');

module.exports = (app, channel) => {
    const router = express.Router();
    const service = new ProductService(channel);
    
    // If channel is available, subscribe to events
    if (channel) {
        subscribeMessage(channel, CUSTOMER_SERVICE, (msg) => {
            logger.info("Received customer event");
            service.SubscribeEvents(msg);
        });
    } else {
        logger.warn("Message broker channel not available. Event subscription skipped.");
    }

    // Root endpoint - Get all products
    router.get('/', async (req, res, next) => {
        try {
            logger.info('Getting all products');
            const { data } = await service.GetProducts();
            return res.status(200).json(data);
        } catch (error) {
            logger.error(`Error getting products: ${error.message}`);
            next(error);
        }
    });

    // Create a product
    router.post("/create", UserAuth, validateBody(productSchema.create), async (req, res, next) => {
        try {
            logger.info(`Creating product: ${req.body.name}`);
            const { data } = await service.CreateProduct(req.body);
            return res.status(201).json(data);
        } catch (error) {
            logger.error(`Error creating product: ${error.message}`);
            next(error);
        }
    });

    // Get products by category
    router.get("/category/:type", validateParams(productSchema.category), async (req, res, next) => {
        try {
            const type = req.params.type;
            logger.info(`Getting products by category: ${type}`);
            
            const { data } = await service.GetProductsByCategory(type);
            
            if (!data || data.length === 0) {
                throw new NotFoundError(`No products found in category: ${type}`);
            }
            
            return res.status(200).json(data);
        } catch (error) {
            logger.error(`Error getting products by category: ${error.message}`);
            next(error);
        }
    });

    // Get product by ID
    router.get("/:id", validateParams(productSchema.params), async (req, res, next) => {
        try {
            const productId = req.params.id;
            logger.info(`Getting product by ID: ${productId}`);
            
            const { data } = await service.GetProductDescription(productId);
            
            if (!data) {
                throw new NotFoundError(`Product not found with ID: ${productId}`);
            }
            
            return res.status(200).json(data);
        } catch (error) {
            logger.error(`Error getting product by ID: ${error.message}`);
            next(error);
        }
    });

    // Get products by IDs
    router.post("/ids", validateBody(productSchema.ids), async (req, res, next) => {
        try {
            const { ids } = req.body;
            logger.info(`Getting products by IDs: ${ids.join(', ')}`);
            
            const products = await service.GetSelectedProducts(ids);
            
            if (!products || products.length === 0) {
                throw new NotFoundError('No products found with the provided IDs');
            }
            
            return res.status(200).json(products);
        } catch (error) {
            logger.error(`Error getting products by IDs: ${error.message}`);
            next(error);
        }
    });

    // Add product to wishlist
    router.put("/wishlist", UserAuth, validateBody(productSchema.params), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const productId = req.body._id;
            
            logger.info(`Adding product ${productId} to wishlist for user ${_id}`);
            
            const { data } = await service.GetProductPayload(
                _id,
                { productId },
                "ADD_TO_WISHLIST"
            );
            
            if (!data) {
                throw new ValidationError('Failed to add product to wishlist');
            }
            
            // Publish message to customer service
            publishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
            
            res.status(200).json(data.data.product);
        } catch (error) {
            logger.error(`Error adding product to wishlist: ${error.message}`);
            next(error);
        }
    });

    // Remove product from wishlist
    router.delete("/wishlist/:id", UserAuth, validateParams(productSchema.params), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const productId = req.params.id;
            
            logger.info(`Removing product ${productId} from wishlist for user ${_id}`);
            
            const { data } = await service.GetProductPayload(
                _id,
                { productId },
                "REMOVE_FROM_WISHLIST"
            );
            
            if (!data) {
                throw new ValidationError('Failed to remove product from wishlist');
            }
            
            // Publish message to customer service
            publishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
            
            res.status(200).json(data.data.product);
        } catch (error) {
            logger.error(`Error removing product from wishlist: ${error.message}`);
            next(error);
        }
    });

    // Add product to cart
    router.put("/cart", UserAuth, validateBody(productSchema.cart), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { _id: productId, qty } = req.body;
            
            logger.info(`Adding product ${productId} to cart for user ${_id}`);
            
            const { data } = await service.GetProductPayload(
                _id,
                { productId, qty },
                "ADD_TO_CART"
            );
            
            if (!data) {
                throw new ValidationError('Failed to add product to cart');
            }
            
            // Publish messages to customer and shopping services
            publishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
            publishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));
            
            const response = { product: data.data.product, unit: data.data.qty };
            
            res.status(200).json(response);
        } catch (error) {
            logger.error(`Error adding product to cart: ${error.message}`);
            next(error);
        }
    });

    // Remove product from cart
    router.delete("/cart/:id", UserAuth, validateParams(productSchema.params), async (req, res, next) => {
        try {
            const { _id } = req.user;
            const productId = req.params.id;
            
            logger.info(`Removing product ${productId} from cart for user ${_id}`);
            
            const { data } = await service.GetProductPayload(
                _id,
                { productId },
                "REMOVE_FROM_CART"
            );
            
            if (!data) {
                throw new ValidationError('Failed to remove product from cart');
            }
            
            // Publish messages to customer and shopping services
            publishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
            publishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));
            
            const response = { product: data.data.product, unit: data.data.qty };
            
            res.status(200).json(response);
        } catch (error) {
            logger.error(`Error removing product from cart: ${error.message}`);
            next(error);
        }
    });

    return router;
};
