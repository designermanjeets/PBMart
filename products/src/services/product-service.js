const { ProductRepository } = require("../database");
const { FormateData } = require("../utils");
const { NotFoundError, ValidationError, DatabaseError, APIError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('product-service');
const { publishMessage } = require('../utils/message-broker');
const { CUSTOMER_SERVICE } = require('../config');
const mongoose = require('mongoose');

// Business logic for handling product-related operations
class ProductService {
  constructor(channel) {
    this.repository = new ProductRepository();
    this.channel = channel;
  }

  // Create a new product
  async CreateProduct(productInputs) {
    try {
      const productResult = await this.repository.CreateProduct(productInputs);
      
      // Publish event if channel is available
      if (this.channel) {
        publishMessage(this.channel, CUSTOMER_SERVICE, { 
          event: 'CREATE_PRODUCT',
          data: { productResult }
        });
      } else {
        logger.warn("Message broker channel not available. Event not published.");
      }
      
      return FormateData(productResult);
    } catch (err) {
      logger.error(`Error creating product: ${err.message}`);
      
      if (err.name === 'ValidationError') {
        throw err;
      }
      
      throw new APIError(`Failed to create product: ${err.message}`);
    }
  }

  // Get all products
  async GetProducts() {
    try {
      const products = await this.repository.Products();
      
      let categories = {};
      
      products.forEach(({ type }) => {
        categories[type] = type;
      });
      
      return FormateData({
        products,
        categories: Object.keys(categories)
      });
    } catch (err) {
      logger.error(`Error getting products: ${err.message}`);
      throw new APIError(`Failed to get products: ${err.message}`);
    }
  }

  // Get product by ID
  async GetProductDescription(productId) {
    try {
      // Convert productId to string if it's an object
      const id = typeof productId === 'object' ? productId.toString() : productId;
      
      // Validate the ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid product ID format');
      }
      
      const product = await this.repository.FindById(id);
      
      if (!product) {
        throw new NotFoundError(`Product not found with ID: ${id}`);
      }
      
      return FormateData(product);
    } catch (err) {
      logger.error(`Error getting product description: ${err.message}`);
      
      if (err.name === 'ValidationError' || err.name === 'NotFoundError') {
        throw err;
      }
      
      throw new APIError(`Failed to get product description: ${err.message}`);
    }
  }

  // Get products by category
  async GetProductsByCategory(category) {
    try {
      const products = await this.repository.FindByCategory(category);
      
      if (!products || products.length === 0) {
        throw new NotFoundError(`No products found in category: ${category}`);
      }
      
      return FormateData(products);
    } catch (err) {
      logger.error(`Error getting products by category: ${err.message}`);
      throw new APIError(`Failed to get products by category: ${err.message}`);
    }
  }

  // Get products by IDs
  async GetSelectedProducts(selectedIds) {
    try {
      const products = await this.repository.FindSelectedProducts(selectedIds);
      
      if (!products || products.length === 0) {
        throw new NotFoundError('No products found with the provided IDs');
      }
      
      return FormateData(products);
    } catch (err) {
      logger.error(`Error getting selected products: ${err.message}`);
      throw new APIError(`Failed to get selected products: ${err.message}`);
    }
  }

  // Get product payload for messaging
  async GetProductPayload(userId, { productId, qty }, event) {
    try {
      const product = await this.repository.FindById(productId);
      
      if (!product) {
        throw new NotFoundError(`Product not found with ID: ${productId}`);
      }
      
      const payload = {
        event,
        data: { userId, product, qty }
      };
      
      return FormateData(payload);
    } catch (error) {
      logger.error(`Error getting product payload: ${error.message}`);
      
      if (error.name === 'NotFoundError') {
        throw error;
      }
      
      if (error.name === 'CastError') {
        throw new ValidationError(`Invalid product ID: ${productId}`);
      }
      
      throw new DatabaseError(`Failed to get product payload: ${error.message}`);
    }
  }

  // Get product by ID
  async GetProductById(productId) {
    try {
      // Convert productId to string if it's an object
      const id = typeof productId === 'object' ? productId.toString() : productId;
      
      // Validate the ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid product ID format');
      }
      
      const product = await this.repository.FindById(id);
      return FormateData(product);
    } catch (err) {
      logger.error(`Error getting product by ID: ${err.message}`);
      
      if (err.name === 'ValidationError' || err.name === 'NotFoundError') {
        throw err;
      }
      
      throw new APIError(`Failed to get product by ID: ${err.message}`);
    }
  }
}

module.exports = ProductService;
