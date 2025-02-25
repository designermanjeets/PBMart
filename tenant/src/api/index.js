module.exports = {
    tenant: require('./tenant')
}; 

// Add a root route handler
module.exports.setupRootRoutes = (app) => {
  app.get('/api/tenant', (req, res) => {
    res.json({
      service: 'Tenant Service',
      version: '1.0.0',
      endpoints: [
        '/api/tenant/signup',
        '/api/tenant/login',
        '/api/tenant/profile',
        '/api/tenant/settings',
        '/api/tenant/users',
        '/api/tenant/users/:id',
        '/api/tenant/health'
      ]
    });
  });
};