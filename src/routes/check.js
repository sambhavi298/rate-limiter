const express = require('express');
const router = express.Router();
const limiter = require('../limiter/limiter');

// POST /check
// Body: { "user_id": "...", "rule": "default" }
router.post('/', async (req, res) => {
    try {
        const userId = req.body.user_id || req.ip;
        const ruleName = req.body.rule || 'default';

        const result = await limiter.check(userId, ruleName);

        if (result.allowed) {
            res.json({
                allowed: true,
                remaining: result.remaining
            });
        } else {
            res.status(429).json({
                allowed: false,
                remaining: result.remaining,
                error: "Too Many Requests"
            });
        }
    } catch (error) {
        console.error('Rate limit check failed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
