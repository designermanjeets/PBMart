// Public route that doesn't require authentication
router.get('/public', async (req, res, next) => {
    try {
        res.status(200).json({
            message: 'This is a public RFQ endpoint that doesn\'t require authentication',
            availableEndpoints: [
                '/api/rfq/public',
                '/api/rfq/health'
            ]
        });
    } catch (err) {
        next(err);
    }
}); 