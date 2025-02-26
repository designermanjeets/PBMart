const express = require('express');
const TemplateRepository = require('../database/repository/template-repository');
const validateToken = require('./middlewares/auth');
const { validateBody, validateParams } = require('./middlewares/validator');
const { templateSchema } = require('./middlewares/schemas');
const { NotFoundError, ValidationError, AuthorizationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('template-api');

module.exports = (app) => {
    const router = express.Router();
    const templateRepository = new TemplateRepository();

    // Check if user is admin
    const isAdmin = (req, res, next) => {
        if (req.user.role !== 'admin') {
            return next(new AuthorizationError('Only administrators can manage templates'));
        }
        next();
    };

    // Get all templates (admin only)
    router.get('/', validateToken, isAdmin, async (req, res, next) => {
        try {
            const templates = await templateRepository.GetAllTemplates();
            res.status(200).json(templates);
        } catch (err) {
            next(err);
        }
    });

    // Get template by ID (admin only)
    router.get('/:id', validateToken, isAdmin, validateParams(templateSchema.params), async (req, res, next) => {
        try {
            const template = await templateRepository.FindTemplateById(req.params.id);
            res.status(200).json(template);
        } catch (err) {
            next(err);
        }
    });

    // Create new template (admin only)
    router.post('/', validateToken, isAdmin, validateBody(templateSchema.create), async (req, res, next) => {
        try {
            const template = await templateRepository.CreateTemplate(req.body);
            res.status(201).json(template);
        } catch (err) {
            next(err);
        }
    });

    // Update template (admin only)
    router.put('/:id', validateToken, isAdmin, validateParams(templateSchema.params), validateBody(templateSchema.update), async (req, res, next) => {
        try {
            const template = await templateRepository.UpdateTemplate(req.params.id, req.body);
            res.status(200).json(template);
        } catch (err) {
            next(err);
        }
    });

    // Delete template (admin only)
    router.delete('/:id', validateToken, isAdmin, validateParams(templateSchema.params), async (req, res, next) => {
        try {
            const result = await templateRepository.DeleteTemplate(req.params.id);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    });

    return router;
}; 