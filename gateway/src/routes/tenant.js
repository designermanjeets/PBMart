const express = require('express');
const router = express.Router();
const { TENANT_SERVICE_URL } = require('../config');
const { tenantService } = require('../utils/circuit-breaker');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Public routes
router.get('/health', async (req, res, next) => {
  try {
    const response = await tenantService.request({
      method: 'get',
      url: `${TENANT_SERVICE_URL}/health`
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Authentication routes
router.post('/signup', async (req, res, next) => {
  try {
    const response = await tenantService.request({
      method: 'post',
      url: `${TENANT_SERVICE_URL}/signup`,
      data: req.body
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const response = await tenantService.request({
      method: 'post',
      url: `${TENANT_SERVICE_URL}/login`,
      data: req.body
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.get('/profile', auth, async (req, res, next) => {
  try {
    const response = await tenantService.request({
      method: 'get',
      url: `${TENANT_SERVICE_URL}/profile`,
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 