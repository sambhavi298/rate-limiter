const fs = require('fs');
const path = require('path');
const redis = require('../redis');
const rules = require('../rules/rules');

// Read Lua script
const luaScript = fs.readFileSync(path.join(__dirname, 'tokenBucket.lua'), 'utf8');

// Define the custom command
redis.defineCommand('acquireToken', {
    numberOfKeys: 1,
    lua: luaScript
});

/**
 * Checks if a request is allowed against the rate limit.
 * @param {string} identifier - Unique identifier for the user/client (e.g. IP, API key)
 * @param {string} ruleName - Name of the rule to apply
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
async function check(identifier, ruleName = 'default') {
    const rule = rules[ruleName] || rules.default;
    if (!rule) {
        throw new Error(`Rule ${ruleName} not found`);
    }

    // Construct a namespaced key
    const key = `ratelimit:${ruleName}:${identifier}`;

    const now = Date.now() / 1000; // current time in seconds
    const requested = 1; // cost of one request

    // Execute Lua script
    const result = await redis.acquireToken(
        key,
        rule.capacity,
        rule.rate,
        now,
        requested
    );

    const [allowed, remaining] = result;

    return {
        allowed: Boolean(allowed),
        remaining: Number(remaining)
    };
}

module.exports = { check };
