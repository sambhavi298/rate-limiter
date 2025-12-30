-- tokenBucket.lua
-- KEYS[1]: The bucket key
-- ARGV[1]: Capacity (bucket size)
-- ARGV[2]: Refill rate (tokens per second)
-- ARGV[3]: Current timestamp (in seconds)
-- ARGV[4]: Tokens requested (cost of the operation)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

-- Use a hash to store 'tokens' and 'last_refill'
local state = redis.call("HMGET", key, "tokens", "last_refill")
local tokens = tonumber(state[1])
local last_refill = tonumber(state[2])

-- Initialize if empty
if not tokens or not last_refill then
    tokens = capacity
    last_refill = now
end

-- Calculate refill based on time delta
local delta = math.max(0, now - last_refill)
local refill_amount = delta * rate
tokens = math.min(capacity, tokens + refill_amount)

local allowed = 0
if tokens >= requested then
    tokens = tokens - requested
    allowed = 1
    -- Update state only if we consumed tokens (or just update time/tokens anyway)
    -- Correct: update time to 'now' so we don't double count this delta later
    redis.call("HMSET", key, "tokens", tokens, "last_refill", now)
    
    -- Set expiry: enough time to fully refill + extra buffer
    local ttl = math.ceil(capacity / rate) + 60
    redis.call("EXPIRE", key, ttl)
else
    -- Assuming we don't consume/update on fail, or we could update the refill so far
    -- Ideally, we should update the refill amount even on failure to avoid recalculating from ancient history
    -- but keeping 'last_refill' old allows potentially larger refill next time.
    -- Better: update state to reflect current tokens (capped) and current time
    redis.call("HMSET", key, "tokens", tokens, "last_refill", now)
end

return {allowed, tokens}
