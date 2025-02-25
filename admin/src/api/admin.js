const AdminService = require('../services/admin-service');
const { validateRequest } = require('./middlewares/validator');
const { adminSchema, roleSchema } = require('./middlewares/schemas');
const { verifyToken, hasPermission } = require('./middlewares/auth');
const { createLogger } = require('../utils/logger');

const logger = createLogger('admin-api');

module.exports = (app, channel) => {
  const service = new AdminService();
  
  // Public login endpoint (no token required)
  app.post('/api/admin/auth/login', validateRequest(adminSchema.login), async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await service.SignIn({ email, password });
      
      logger.info(`Admin login successful: ${email}`);
      
      return res.json(result);
    } catch (error) {
      next(error);
    }
  });
  
  // Create admin user
  app.post(
    '/api/admin/users',
    verifyToken,
    hasPermission('create_admin'),
    validateRequest(adminSchema.create),
    async (req, res, next) => {
      try {
        const result = await service.CreateAdmin(req.body);
        
        logger.info(`Admin user created: ${req.body.email}`);
        
        return res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Get all admin users
  app.get(
    '/api/admin/users',
    verifyToken,
    hasPermission('view_admins'),
    async (req, res, next) => {
      try {
        const result = await service.GetAllAdmins(req.query);
        
        logger.info('Admin users retrieved');
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Get admin user by ID
  app.get(
    '/api/admin/users/:id',
    verifyToken,
    hasPermission('view_admins'),
    async (req, res, next) => {
      try {
        const result = await service.GetAdminById(req.params.id);
        
        logger.info(`Admin user retrieved: ${req.params.id}`);
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Update admin user
  app.put(
    '/api/admin/users/:id',
    verifyToken,
    hasPermission('update_admin'),
    validateRequest(adminSchema.update),
    async (req, res, next) => {
      try {
        const result = await service.UpdateAdmin(req.params.id, req.body);
        
        logger.info(`Admin user updated: ${req.params.id}`);
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Delete admin user
  app.delete(
    '/api/admin/users/:id',
    verifyToken,
    hasPermission('delete_admin'),
    async (req, res, next) => {
      try {
        const result = await service.DeleteAdmin(req.params.id);
        
        logger.info(`Admin user deleted: ${req.params.id}`);
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Create role
  app.post(
    '/api/admin/roles',
    verifyToken,
    hasPermission('manage_roles'),
    validateRequest(roleSchema.create),
    async (req, res, next) => {
      try {
        const result = await service.CreateRole(req.body);
        
        logger.info(`Role created: ${req.body.name}`);
        
        return res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    }
  );
  
  // Get all roles
  app.get(
    '/api/admin/roles',
    verifyToken,
    hasPermission('view_roles'),
    async (req, res, next) => {
      try {
        const result = await service.GetAllRoles();
        
        logger.info('Roles retrieved');
        
        return res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );

  // Add this at the beginning of your routes
  app.get('/api/admin/test', (req, res) => {
    res.json({
      message: 'Admin service is working',
      timestamp: new Date().toISOString()
    });
  });
}; 