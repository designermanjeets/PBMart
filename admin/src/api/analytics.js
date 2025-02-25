const AnalyticsService = require('../services/analytics-service');
const { validateRequest } = require('./middlewares/validator');
const { analyticsSchema } = require('./middlewares/schemas');
const { verifyToken, hasPermission } = require('./middlewares/auth');
const { createLogger } = require('../utils/logger');

const logger = createLogger('analytics-api');

module.exports = (app, channel) => {
  const service = new AnalyticsService();
  
  // Get dashboard summary
  app.get(
    '/api/admin/dashboard',
    verifyToken,
    hasPermission('view_dashboard'),
    async (req, res, next) => {
      try {
        const result = await service.GetDashboardSummary();
        
        logger.info('Dashboard summary retrieved');
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Get sales analytics
  app.get(
    '/api/admin/analytics/sales',
    verifyToken,
    hasPermission('view_analytics'),
    validateRequest(analyticsSchema.query, 'query'),
    async (req, res, next) => {
      try {
        const result = await service.GetSalesAnalytics(req.query);
        
        logger.info('Sales analytics retrieved');
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Get user analytics
  app.get(
    '/api/admin/analytics/users',
    verifyToken,
    hasPermission('view_analytics'),
    validateRequest(analyticsSchema.query, 'query'),
    async (req, res, next) => {
      try {
        const result = await service.GetUserAnalytics(req.query);
        
        logger.info('User analytics retrieved');
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Get inventory analytics
  app.get(
    '/api/admin/analytics/inventory',
    verifyToken,
    hasPermission('view_analytics'),
    async (req, res, next) => {
      try {
        const result = await service.GetInventoryAnalytics();
        
        logger.info('Inventory analytics retrieved');
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Generate report
  app.post(
    '/api/admin/reports/:type',
    verifyToken,
    hasPermission('generate_reports'),
    async (req, res, next) => {
      try {
        const { type } = req.params;
        const result = await service.GenerateReport(type, req.body);
        
        logger.info(`Report generated: ${type}`);
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
}; 