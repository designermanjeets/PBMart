const express = require('express');
const router = express.Router();
const { PRODUCT_SERVICE_URL } = require('../config');
const { productService } = require('../utils/circuit-breaker');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Public routes
router.get('/health', async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'get',
      url: `${PRODUCT_SERVICE_URL}/health`
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'get',
      url: `${PRODUCT_SERVICE_URL}/`
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/category/:type', async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'get',
      url: `${PRODUCT_SERVICE_URL}/category/${req.params.type}`
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'get',
      url: `${PRODUCT_SERVICE_URL}/${req.params.id}`
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.post('/create', auth, async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'post',
      url: `${PRODUCT_SERVICE_URL}/product/create`,
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

router.post('/ids', auth, async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'post',
      url: `${PRODUCT_SERVICE_URL}/ids`,
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

router.put('/wishlist', auth, async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'put',
      url: `${PRODUCT_SERVICE_URL}/wishlist`,
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

router.delete('/wishlist/:id', auth, async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'delete',
      url: `${PRODUCT_SERVICE_URL}/wishlist/${req.params.id}`,
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.put('/cart', auth, async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'put',
      url: `${PRODUCT_SERVICE_URL}/cart`,
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

router.delete('/cart/:id', auth, async (req, res, next) => {
  try {
    const response = await productService.request({
      method: 'delete',
      url: `${PRODUCT_SERVICE_URL}/cart/${req.params.id}`,
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