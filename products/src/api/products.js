const { CUSTOMER_SERVICE, SHOPPING_SERVICE } = require("../config");
const ProductService = require("../services/product-service");
const {
  PublishCustomerEvent,
  PublishShoppingEvent,
  PublishMessage,
} = require("../utils");
const UserAuth = require("./middlewares/auth");
const { validateBody, validateParams, validateQuery } = require('./middlewares/validator');
const { productSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError } = require('../utils/errors');
const mongoose = require("mongoose");
const { createLogger } = require('../utils/logger');
const logger = createLogger('products-api');

module.exports = (app, channel) => {
  const service = new ProductService();

  // Health check endpoint
  app.get('/health', async (req, res, next) => {
    try {
      // Check database connection
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      // Check message broker connection
      let mqStatus = 'not configured';
      if (channel) {
        mqStatus = 'connected';
      }
      
      return res.status(200).json({
        service: 'Products Service',
        status: 'active',
        time: new Date().toISOString(),
        database: dbStatus,
        messageBroker: mqStatus
      });
    } catch (err) {
      next(err);
    }
  });

  // Get all products
  app.get('/', async (req, res, next) => {
    try {
      logger.info('Getting all products');
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      logger.error(`Error getting products: ${error.message}`);
      next(error);
    }
  });

  app.get("/whoami", (req, res, next) => {
    return res
      .status(200)
      .json({ msg: "/ or /products : I am products Service" });
  });

  // Create a product
  app.post("/product/create", UserAuth, validateBody(productSchema.create), async (req, res, next) => {
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
  app.get("/category/:type", validateParams(productSchema.category), async (req, res, next) => {
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
  app.get("/:id", validateParams(productSchema.params), async (req, res, next) => {
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
  app.post("/ids", validateBody(productSchema.ids), async (req, res, next) => {
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
  app.put("/wishlist", UserAuth, validateBody(productSchema.params), async (req, res, next) => {
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
      PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
      
      res.status(200).json(data.data.product);
    } catch (error) {
      logger.error(`Error adding product to wishlist: ${error.message}`);
      next(error);
    }
  });

  // Remove product from wishlist
  app.delete("/wishlist/:id", UserAuth, validateParams(productSchema.params), async (req, res, next) => {
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
      PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
      
      res.status(200).json(data.data.product);
    } catch (error) {
      logger.error(`Error removing product from wishlist: ${error.message}`);
      next(error);
    }
  });

  // Add product to cart
  app.put("/cart", UserAuth, validateBody(productSchema.cart), async (req, res, next) => {
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
      PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
      PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));
      
      const response = { product: data.data.product, unit: data.data.qty };
      
      res.status(200).json(response);
    } catch (error) {
      logger.error(`Error adding product to cart: ${error.message}`);
      next(error);
    }
  });

  // Remove product from cart
  app.delete("/cart/:id", UserAuth, validateParams(productSchema.params), async (req, res, next) => {
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
      PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
      PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));
      
      const response = { product: data.data.product, unit: data.data.qty };
      
      res.status(200).json(response);
    } catch (error) {
      logger.error(`Error removing product from cart: ${error.message}`);
      next(error);
    }
  });
};
