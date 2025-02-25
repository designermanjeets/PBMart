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
        '/api/tenant/register',
        '/api/tenant/login',
        '/api/tenant/profile',
        '/api/tenant/products',
        '/api/tenant/orders',
        '/api/tenant/settings',
        '/api/tenant/support',
        '/api/tenant/health' 
      ]
    });
  });
};