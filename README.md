# Rate Limiter Service

A distributed rate limiter service using Redis and the Token Bucket algorithm.

## Structure

- `src/server.js`: Entry point.
- `src/redis.js`: Redis connection setup.
- `src/limiter/`: Contains the logic (Lua script + JS wrapper).
- `src/rules/`: Configuration for rate limits.
- `src/routes/`: API endpoints.

## Prerequisites

- Node.js
- Redis server running (default localhost:6379)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Redis (if not running):
   ```bash
   redis-server
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Usage

**Check Rate Limit:**

POST `/check`

```json
{
  "user_id": "user123",
  "rule": "default"
}
```

Response (Allowed):
```json
{
  "allowed": true,
  "remaining": 9
}
```

Response (Denied):
```json
{
  "allowed": false,
  "remaining": 0,
  "error": "Too Many Requests"
}
```
