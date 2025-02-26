module.exports = {
    tenants: require('./tenants')
}; 

// Add a root route handler
module.exports.setupRootRoutes = (app) => {
  app.get('/api/tenants', (req, res) => {
    res.json({
      service: 'Tenants Service',
      version: '1.0.0',
      endpoints: [
        '/api/tenants/signup',
        '/api/tenants/login',
        '/api/tenants/profile',
        '/api/tenants/settings',
        '/api/tenants/users',
        '/api/tenants/users/:id',
        '/api/tenants/health'
      ]
    });
  });
};