# PostgresConnection

PostgreSQL database connection implementation using the `pg` library's connection pooling.

## Overview

`PostgresConnection` implements the `IDatabaseConnection` interface and provides a robust connection pool for PostgreSQL databases with automatic retry logic, error handling, and connection monitoring.

## Features

- **Connection Pooling**: Efficient connection management with configurable pool size
- **Automatic Retry Logic**: Retries transient connection errors (ECONNREFUSED, ETIMEDOUT, etc.)
- **Error Wrapping**: Provides context-rich error messages for debugging
- **Health Checks**: Built-in connection testing for monitoring
- **Pool Statistics**: Real-time metrics for connection pool monitoring
- **Event Handling**: Automatic handling of pool events (error, connect, remove)

## Usage

### Basic Usage

```typescript
import { PostgresConnection } from './services/implementations/PostgresConnection';

// Create connection with default config (from environment variables)
const connection = new PostgresConnection();

// Execute a simple query
const users = await connection.query('SELECT * FROM users');

// Execute a parameterized query (prevents SQL injection)
const user = await connection.query(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
);

// Close connection when done
await connection.end();
```

### Using with Transactions

```typescript
// Get a client for transaction
const client = await connection.getClient();

try {
  await client.query('BEGIN');
  
  await client.query('INSERT INTO users (email) VALUES ($1)', ['user@example.com']);
  await client.query('INSERT INTO test_results (user_id, character_type) VALUES ($1, $2)', [userId, 'zombie']);
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release(); // Always release the client back to the pool
}
```

### Custom Configuration

```typescript
import { PostgresConnection } from './services/implementations/PostgresConnection';
import { PoolConfig } from 'pg';

const customConfig: PoolConfig = {
  host: 'custom-host.rds.amazonaws.com',
  port: 5432,
  database: 'my_database',
  user: 'my_user',
  password: 'my_password',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
};

const connection = new PostgresConnection(customConfig);
```

### Health Checks

```typescript
// Test if database is reachable
const isHealthy = await connection.testConnection();

if (!isHealthy) {
  console.error('Database connection is not healthy');
}
```

### Monitoring Pool Statistics

```typescript
const stats = connection.getPoolStats();

console.log('Pool Statistics:', {
  totalCount: stats.totalCount,      // Total number of clients in pool
  idleCount: stats.idleCount,        // Number of idle clients
  waitingCount: stats.waitingCount,  // Number of queued requests
  isConnected: stats.isConnected,    // Connection state
});
```

## Configuration

### Environment Variables

The connection uses the following environment variables when no custom config is provided:

- `DB_HOST` - Database host (default: 'localhost')
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: 'halloween_test')
- `DB_USER` - Database user (default: 'postgres')
- `DB_PASSWORD` - Database password (default: '')

### Pool Configuration

Default pool settings:

- **max**: 20 connections
- **idleTimeoutMillis**: 30000 (30 seconds)
- **connectionTimeoutMillis**: 2000 (2 seconds)

## Error Handling

### Automatic Retry

The connection automatically retries the following transient errors up to 3 times:

- `ECONNREFUSED` - Connection refused
- `ECONNRESET` - Connection reset
- `ETIMEDOUT` - Connection timeout
- `ENOTFOUND` - Host not found
- `ENETUNREACH` - Network unreachable
- `EAI_AGAIN` - DNS lookup timeout

### Error Context

All errors are wrapped with additional context:

```typescript
try {
  await connection.query('SELECT * FROM nonexistent_table');
} catch (error) {
  // Error message includes context:
  // "Database error in SELECT * FROM nonexistent_table: relation "nonexistent_table" does not exist"
  console.error(error.message);
}
```

## Best Practices

### 1. Always Use Parameterized Queries

```typescript
// ✅ GOOD - Prevents SQL injection
await connection.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
);

// ❌ BAD - Vulnerable to SQL injection
await connection.query(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

### 2. Release Clients After Use

```typescript
const client = await connection.getClient();
try {
  // Use client
  await client.query('SELECT 1');
} finally {
  client.release(); // Always release, even if error occurs
}
```

### 3. Close Connection on Shutdown

```typescript
// In your application shutdown handler
process.on('SIGTERM', async () => {
  await connection.end();
  process.exit(0);
});
```

### 4. Monitor Pool Health

```typescript
// Periodically check pool statistics
setInterval(() => {
  const stats = connection.getPoolStats();
  if (stats.waitingCount > 10) {
    console.warn('High number of waiting connections:', stats.waitingCount);
  }
}, 60000); // Every minute
```

## Testing

### Unit Tests

Unit tests use mocked `pg` Pool and don't require a database:

```bash
npm test -- PostgresConnection.test.ts
```

### Integration Tests

Integration tests require a running PostgreSQL database:

```bash
# Set up test database
export TEST_DB_HOST=localhost
export TEST_DB_PORT=5432
export TEST_DB_NAME=halloween_test
export TEST_DB_USER=postgres
export TEST_DB_PASSWORD=your-password

# Run integration tests
npm test -- PostgresConnection.integration.test.ts
```

To skip integration tests:

```bash
export SKIP_INTEGRATION_TESTS=true
npm test
```

## Implementation Details

### Connection Pool Events

The implementation listens to three pool events:

1. **error**: Logs unexpected errors on idle clients
2. **connect**: Updates connection state to true
3. **remove**: Updates connection state to false when pool is empty

### Retry Logic

Retry behavior:

- Maximum 3 attempts
- Exponential backoff: 1s, 2s, 3s
- Only retries on transient connection errors
- Non-retryable errors fail immediately

### Thread Safety

The `pg` Pool is thread-safe and handles concurrent queries efficiently. Multiple queries can be executed simultaneously without manual synchronization.

## Related Files

- Interface: `src/services/interfaces/IDatabaseConnection.ts`
- Configuration: `src/config/database.ts`
- Unit Tests: `src/services/__tests__/PostgresConnection.test.ts`
- Integration Tests: `src/services/__tests__/PostgresConnection.integration.test.ts`

## Future Enhancements

Potential improvements:

- Connection pooling metrics export (Prometheus)
- Query performance logging
- Automatic connection pool scaling
- Read replica support
- Query result caching
