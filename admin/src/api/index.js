module.exports = {
  admin: require('./admin'),
  analytics: require('./analytics'),
  users: require('./users'),
  appEvents: require('./app-events')
};

// Add a root route handler
module.exports.setupRootRoutes = (app) => {
  app.get('/api/admin', (req, res) => {
    res.json({
      service: 'Admin Service',
      version: '1.0.0',
      endpoints: [
        '/api/admin/login',
        '/api/admin/users',
        '/api/admin/roles',
        '/api/admin/dashboard',
        '/api/admin/analytics/sales',
        '/api/admin/analytics/users',
        '/api/admin/analytics/inventory',
        '/api/admin/reports',
        '/api/admin/customers'
      ]
    });
  });
}; 