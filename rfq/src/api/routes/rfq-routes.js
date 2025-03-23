const express = require('express');
const { validateToken } = require('../middlewares/auth');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('rfq-routes');
const router = express.Router();

// Public routes that don't require authentication
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'RFQ service is running',
        timestamp: new Date()
    });
});

router.get('/public', (req, res) => {
    res.status(200).json({
        message: 'This is a public RFQ endpoint that doesn\'t require authentication',
        availableEndpoints: [
            '/api/rfq/public',
            '/api/rfq/health'
        ]
    });
});

// Simple protected routes
router.get('/', validateToken, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Get all RFQs',
        data: [],
        user: req.user
    });
});

router.post('/', validateToken, (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'RFQ created successfully',
        data: {
            id: `rfq-${Date.now()}`,
            ...req.body,
            createdBy: req.user.id,
            createdAt: new Date()
        }
    });
});

router.get('/:id', validateToken, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: `Get RFQ with ID: ${req.params.id}`,
        data: {
            id: req.params.id,
            title: 'Sample RFQ',
            description: 'This is a sample RFQ',
            createdAt: new Date()
        }
    });
});

router.put('/:id', validateToken, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: `RFQ with ID: ${req.params.id} updated successfully`,
        data: {
            id: req.params.id,
            ...req.body,
            updatedAt: new Date()
        }
    });
});

router.delete('/:id', validateToken, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: `RFQ with ID: ${req.params.id} deleted successfully`
    });
});

module.exports = router; 