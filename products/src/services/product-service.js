const { ProductRepository } = require("../database");
const { FormateData } = require("../utils");
const { NotFoundError, ValidationError, DatabaseError, APIError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('product-service');
const { publishMessage } = require('../utils/message-broker');
const { CUSTOMER_SERVICE } = require('../config');

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
      throw new APIError('Failed to create product');
    }
  }

  // Get all products
  async GetProducts() {
    try {
      const products = await this.repository.Products();
      return FormateData(products);
    } catch (error) {
      logger.error(`Error getting products: ${error.message}`);
      throw new DatabaseError(`Failed to get products: ${error.message}`);
    }
  }

  // Get product by ID
  async GetProductDescription(productId) {
    try {
      const product = await this.repository.FindById(productId);
      
      if (!product) {
        throw new NotFoundError(`Product not found with ID: ${productId}`);
      }
      
      return FormateData(product);
    } catch (error) {
      logger.error(`Error getting product description: ${error.message}`);
      
      if (error.name === 'NotFoundError') {
        throw error;
      }
      
      if (error.name === 'CastError') {
        throw new ValidationError(`Invalid product ID: ${productId}`);
      }
      
      throw new DatabaseError(`Failed to get product description: ${error.message}`);
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
    } catch (error) {
      logger.error(`Error getting products by category: ${error.message}`);
      
      if (error.name === 'NotFoundError') {
        throw error;
      }
      
      throw new DatabaseError(`Failed to get products by category: ${error.message}`);
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
    } catch (error) {
      logger.error(`Error getting selected products: ${error.message}`);
      
      if (error.name === 'NotFoundError') {
        throw error;
      }
      
      throw new DatabaseError(`Failed to get selected products: ${error.message}`);
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
}

module.exports = ProductService;
