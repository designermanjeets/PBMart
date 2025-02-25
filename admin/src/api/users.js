const { verifyToken, hasPermission } = require('./middlewares/auth');
const { createLogger } = require('../utils/logger');
const axios = require('axios');
const { CUSTOMER_SERVICE } = require('../config');

const logger = createLogger('users-api');

module.exports = (app, channel) => {
  // Get all users
  app.get(
    '/api/admin/customers',
    verifyToken,
    hasPermission('view_customers'),
    async (req, res, next) => {
      try {
        // In a real implementation, this would use the message broker
        // For now, we'll make a direct API call to the customer service
        const response = await axios.get(`http://${CUSTOMER_SERVICE}/customers`, {
          headers: {
            Authorization: req.headers.authorization
          },
          params: req.query
        });
        
        logger.info('Customers retrieved');
        
        return res.json(response.data);
      } catch (error) {
        logger.error(`Error retrieving customers: ${error.message}`);
        next(error);
      }
    }
  );
  
  // Get user by ID
  app.get(
    '/api/admin/customers/:id',
    verifyToken,
    hasPermission('view_customers'),
    async (req, res, next) => {
      try {
        // In a real implementation, this would use the message broker
        const response = await axios.get(`http://${CUSTOMER_SERVICE}/customers/${req.params.id}`, {
          headers: {
            Authorization: req.headers.authorization
          }
        });
        
        logger.info(`Customer retrieved: ${req.params.id}`);
        
        return res.json(response.data);
      } catch (error) {
        logger.error(`Error retrieving customer: ${error.message}`);
        next(error);
      }
    }
  );
  
  // Update user
  app.put(
    '/api/admin/customers/:id',
    verifyToken,
    hasPermission('update_customer'),
    async (req, res, next) => {
      try {
        // In a real implementation, this would use the message broker
        const response = await axios.put(
          `http://${CUSTOMER_SERVICE}/customers/${req.params.id}`,
          req.body,
          {
            headers: {
              Authorization: req.headers.authorization
            }
          }
        );
        
        logger.info(`Customer updated: ${req.params.id}`);
        
        return res.json(response.data);
      } catch (error) {
        logger.error(`Error updating customer: ${error.message}`);
        next(error);
      }
    }
  );
  
  // Delete user
  app.delete(
    '/api/admin/customers/:id',
    verifyToken,
    hasPermission('delete_customer'),
    async (req, res, next) => {
      try {
        // In a real implementation, this would use the message broker
        const response = await axios.delete(
          `http://${CUSTOMER_SERVICE}/customers/${req.params.id}`,
          {
            headers: {
              Authorization: req.headers.authorization
            }
          }
        );
        
        logger.info(`Customer deleted: ${req.params.id}`);
        
        return res.json(response.data);
      } catch (error) {
        logger.error(`Error deleting customer: ${error.message}`);
        next(error);
      }
    }
  );
}; 