const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Rate limiter middleware
async function rateLimitMiddleware(req, res, next) {
    const clientId = req.header("x-client-id");

    if (!clientId) {
        return res.status(400).json({ error: "Missing x-client-id header" });
    }

    try {
        const response = await axios.post("http://localhost:3000/check", {
            client_id: clientId,
            rule_id: "api_read"
        });

        if (!response.data.allowed) {
            return res.status(429).json({ error: "Rate limit exceeded" });
        }

        next();
    } catch (err) {
        if (err.response && err.response.status === 429) {
            return res.status(429).json({ error: "Rate limit exceeded" });
        }

        // Fail-open decision (explicit)
        next();
    }
}

// Protected route
app.get("/data", rateLimitMiddleware, (req, res) => {
    res.json({ message: "Protected data accessed" });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Protected API running on port ${PORT}`);
});
