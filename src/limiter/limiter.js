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
async function check(identifier, ruleName = 'api_read') {
    const rule = rules[ruleName];

    if (!rule) {
        throw new Error(`Rule "${ruleName}" not found`);
    }

    // Construct a namespaced key: rate:{ruleId}:{clientId}
    const key = `rate:${rule.id}:${identifier}`;

    const now = Math.floor(Date.now() / 1000); // current time in seconds

    // Execute Lua script
    // ARGV[1] = capacity
    // ARGV[2] = refill_rate
    // ARGV[3] = refill_interval (seconds)
    // ARGV[4] = current_timestamp (seconds)
    const result = await redis.acquireToken(
        key,
        rule.capacity,
        rule.refillRate,
        rule.refillInterval,
        now
    );

    const [allowed, remaining] = result;

    return {
        allowed: Boolean(allowed),
        remaining: Number(remaining)
    };
}

module.exports = { check };
