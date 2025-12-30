-- KEYS[1] = rate:{ruleId}:{clientId}
-- ARGV[1] = capacity
-- ARGV[2] = refill_rate
-- ARGV[3] = refill_interval (seconds)
-- ARGV[4] = current_timestamp (seconds)

local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local refill_interval = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "tokens", "last_refill_ts")

local tokens = tonumber(data[1])
local last_refill_ts = tonumber(data[2])

-- First request: initialize bucket
if tokens == nil then
  tokens = capacity
  last_refill_ts = now
end

-- Calculate refill
local elapsed = now - last_refill_ts
if elapsed > 0 then
  local refill_tokens = math.floor((elapsed * refill_rate) / refill_interval)
  if refill_tokens > 0 then
    tokens = math.min(capacity, tokens + refill_tokens)
    last_refill_ts = now
  end
end

local allowed = 0
if tokens > 0 then
  tokens = tokens - 1
  allowed = 1
end

redis.call("HMSET", key,
  "tokens", tokens,
  "last_refill_ts", last_refill_ts
)

return { allowed, tokens }
