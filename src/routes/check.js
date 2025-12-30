const express = require("express");
const router = express.Router();

const rules = require("../rules/rules");
const { checkRateLimit } = require("../limiter/limiter");

router.post("/", async (req, res) => {
    const { client_id, rule_id } = req.body;

    if (!client_id || !rule_id) {
        return res.status(400).json({
            error: "client_id and rule_id are required"
        });
    }

    const rule = rules[rule_id];
    if (!rule) {
        return res.status(400).json({
            error: "unknown rule_id"
        });
    }

    try {
        const result = await checkRateLimit({
            clientId: client_id,
            rule
        });

        if (!result.allowed) {
            return res.status(429).json({
                allowed: false,
                remaining: result.remaining
            });
        }

        return res.json({
            allowed: true,
            remaining: result.remaining
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "rate limiter failure"
        });
    }
});

module.exports = router;
