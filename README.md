# Distributed Rate Limiter

A high-performance, distributed rate limiter service built with Node.js, Redis, and Lua. It implements the **Token Bucket algorithm** to manage request traffic efficiently and atomically.

## Features

- 🚀 **Distributed**: backed by Redis, suitable for horizontal scaling.
- ⚡ **Atomic Operations**: uses custom Lua scripts to ensure race-condition-free token consumption.
- ⚙️ **Configurable Rules**: easy-to-define rate limits (capacity, refill rate, interval).
- 🛡️ **Fail-Open Design**: ensures service continuity if the rate limiter fails (implemeted in demo middleware).

## Prerequisites

- **Node.js** (v18+)
- **Redis** server (v3.0+) running on default port `6379`.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sambhavi298/rate-limiter.git
   cd rate-limiter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure Redis is running (e.g., using Microsoft OpenTech Redis on Windows or Docker):
   ```bash
   redis-cli ping
   # Expected: PONG
   ```

## Usage

### 1. Start the Rate Limiter Service

The core service listens on port `3000`.

```bash
npm start
# OR
node src/server.js
```

### 2. Check Rate Limit API

**Endpoint**: `POST http://localhost:3000/check`

**Request Body**:
```json
{
  "client_id": "unique_user_id",
  "rule_id": "api_read"
}
```
*Note: available rules are defined in `src/rules/rules.js`.*

**Response (Allowed)**:
```json
{
  "allowed": true,
  "remaining": 99
}
```

**Response (Blocked)**:
```json
{
  "allowed": false,
  "remaining": 0,
  "error": "Too Many Requests"
}
```

## Demo: Protected API

This project includes a demo "Protected Server" that uses the rate limiter service as middleware.

1. **Start the Rate Limiter** (Terminal 1):
   ```bash
   node src/server.js
   ```

2. **Start the Demo Server** (Terminal 2):
   ```bash
   node src/demo/protectedServer.js
   ```
   *Runs on port 4000.*

3. **Test Request**:
   ```bash
   curl -H "x-client-id: user1" http://localhost:4000/data
   ```

## Configuration

Rate limiting rules are defined in `src/rules/rules.js`:

```javascript
api_read: {
  id: "api_read",
  capacity: 100,      // Max tokens
  refillRate: 100,    // Tokens added per interval
  refillInterval: 60  // Interval in seconds
}
```

## Project Structure

```
rate-limiter/
├── src/
│   ├── server.js          # Main Rate Limiter Service
│   ├── redis.js           # Redis Connection
│   ├── rules/             # Configuration Rules
│   ├── limiter/           
│   │   ├── tokenBucket.lua # Atomic Lua Script
│   │   └── limiter.js      # Redis Wrapper
│   ├── routes/
│   │   └── check.js        # API Endpoint
│   └── demo/
│       └── protectedServer.js # Example usage
└── README.md
```
