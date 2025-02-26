const express = require('express');
const { validateToken, isAdmin, isVendor } = require('../middlewares/auth');

module.exports = (controller) => {
    const router = express.Router();
    
    // Apply auth middleware to all routes
    router.use(validateToken);
    
    // Quote routes
    router.post('/', controller.CreateQuote.bind(controller));
    router.get('/', controller.GetQuotes.bind(controller));
    router.get('/:id', controller.GetQuoteById.bind(controller));
    router.put('/:id', controller.UpdateQuote.bind(controller));
    router.delete('/:id', controller.DeleteQuote.bind(controller));
    
    return router;
}; 