const express = require('express');
const router = express.Router();
const { SHOPPING_SERVICE_URL } = require('../config');
const { shoppingService } = require('../utils/circuit-breaker');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Public routes
router.get('/health', async (req, res, next) => {
  try {
    const response = await shoppingService.request({
      method: 'get',
      url: `${SHOPPING_SERVICE_URL}/health`
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.post('/cart', auth, async (req, res, next) => {
  try {
    const response = await shoppingService.request({
      method: 'post',
      url: `${SHOPPING_SERVICE_URL}/cart`,
      data: req.body,
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/cart', auth, async (req, res, next) => {
  try {
    const response = await shoppingService.request({
      method: 'get',
      url: `${SHOPPING_SERVICE_URL}/cart`,
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.delete('/cart/:id', auth, async (req, res, next) => {
  try {
    const response = await shoppingService.request({
      method: 'delete',
      url: `${SHOPPING_SERVICE_URL}/cart/${req.params.id}`,
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.post('/order', auth, async (req, res, next) => {
  try {
    const response = await shoppingService.request({
      method: 'post',
      url: `${SHOPPING_SERVICE_URL}/order`,
      data: req.body,
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/orders', auth, async (req, res, next) => {
  try {
    const response = await shoppingService.request({
      method: 'get',
      url: `${SHOPPING_SERVICE_URL}/orders`,
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