const TenantService = require('../services/tenant-service');
const { SubscribeMessage } = require('../utils');
const { CUSTOMER_SERVICE } = require('../config');
const UserAuth = require('./middlewares/auth');

module.exports = (app, channel) => {
    const service = new TenantService();

    // Subscribe to events only if channel exists
    if (channel) {
        SubscribeMessage(channel, service);
    } else {
        console.log('Message broker channel not available, running without event subscription');
    }

    // Health check endpoint
    app.get('/health', async (req, res) => {
        const { repository } = service;
        try {
            // Check database connection
            const dbStatus = await repository.checkConnection();
            
            // Check message broker connection
            const brokerStatus = channel ? 'connected' : 'disconnected';
            
            return res.status(200).json({
                service: 'Tenant Service',
                status: 'active',
                time: new Date(),
                database: dbStatus ? 'connected' : 'disconnected',
                messageBroker: brokerStatus
            });
        } catch (err) {
            return res.status(503).json({
                service: 'Tenant Service',
                status: 'error',
                time: new Date(),
                error: err.message
            });
        }
    });

    // Tenant registration endpoint
    app.post('/signup', async (req, res, next) => {
        try {
            const { name, email, password, phone, companyName, businessType, address } = req.body;
            const data = await service.SignUp({ name, email, password, phone, companyName, businessType, address });
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    // Tenant login endpoint
    app.post('/login', async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const data = await service.SignIn({ email, password });
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    // Get tenant profile
    app.get('/profile', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const data = await service.GetTenantProfile(_id);
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    // Update tenant profile
    app.put('/profile', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const data = await service.UpdateTenantProfile(_id, req.body);
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    // Admin routes - these would typically be protected with admin middleware
    app.get('/admin/tenants', UserAuth, async (req, res, next) => {
        try {
            const { page = 1, limit = 10, ...query } = req.query;
            const data = await service.GetTenants(query, { page: parseInt(page), limit: parseInt(limit) });
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.put('/admin/tenants/:id/verify', UserAuth, async (req, res, next) => {
        try {
            const { id } = req.params;
            const data = await service.VerifyTenant(id);
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.put('/admin/tenants/:id/deactivate', UserAuth, async (req, res, next) => {
        try {
            const { id } = req.params;
            const data = await service.DeactivateTenant(id);
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });

    app.put('/admin/tenants/:id/subscription', UserAuth, async (req, res, next) => {
        try {
            const { id } = req.params;
            const { plan, expiryDate } = req.body;
            const data = await service.ChangeSubscription(id, plan, expiryDate);
            return res.json(data);
        } catch (err) {
            next(err);
        }
    });
}; 