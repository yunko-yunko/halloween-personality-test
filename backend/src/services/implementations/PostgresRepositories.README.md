# PostgreSQL Repository Implementations

This document describes the PostgreSQL repository implementations for the Halloween Personality Test application.

## Overview

The PostgreSQL repositories provide data access implementations for user and test result data. They implement the repository interfaces defined in `src/services/interfaces/` and use raw SQL queries with parameterized statements to prevent SQL injection.

## Implementations

### PostgresUserRepository

Implements `IUserRepository` interface for user data access.

**Methods:**
- `findByEmail(email: string): Promise<User | null>` - Find user by email address
- `create(email: string): Promise<User>` - Create new user
- `updateLastLogin(userId: string): Promise<void>` - Update user's last login timestamp

**Features:**
- Parameterized SQL queries for security
- Proper date type handling
- Unique constraint handling for duplicate emails
- Descriptive error messages

**Example Usage:**
```typescript
import { PostgresConnection } from './PostgresConnection';
import { PostgresUserRepository } from './PostgresUserRepository';

const connection = new PostgresConnection();
const userRepository = new PostgresUserRepository(connection);

// Create a new user
const user = await userRepository.create('user@example.com');
console.log('Created user:', user);

// Find user by email
const foundUser = await userRepository.findByEmail('user@example.com');
console.log('Found user:', foundUser);

// Update last login
await userRepository.updateLastLogin(user.id);
```

### PostgresTestResultRepository

Implements `ITestResultRepository` interface for test result data access.

**Methods:**
- `create(result: TestResultInput): Promise<TestResult>` - Create new test result
- `findByUserId(userId: string): Promise<TestResult[]>` - Find all test results for a user in reverse chronological order

**Features:**
- Parameterized SQL queries for security
- Foreign key constraint handling
- Automatic timestamp generation
- Results sorted by completion date (newest first)
- Proper date type handling

**Example Usage:**
```typescript
import { PostgresConnection } from './PostgresConnection';
import { PostgresTestResultRepository } from './PostgresTestResultRepository';

const connection = new PostgresConnection();
const resultRepository = new PostgresTestResultRepository(connection);

// Create a test result
const result = await resultRepository.create({
  userId: 'user-id',
  characterType: 'zombie',
  mbtiType: 'ESTJ',
});
console.log('Created result:', result);

// Get all results for a user
const results = await resultRepository.findByUserId('user-id');
console.log('User results:', results);
```

## Database Schema

These repositories require the following database tables:

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### test_results table
```sql
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_type VARCHAR(50) NOT NULL,
  mbti_type VARCHAR(4) NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_completed_at ON test_results(completed_at DESC);
```

## Security Features

### SQL Injection Prevention

All queries use parameterized statements to prevent SQL injection:

```typescript
// ✅ SAFE - Parameterized query
const sql = 'SELECT * FROM users WHERE email = $1';
await connection.query(sql, [email]);

// ❌ UNSAFE - String concatenation (never do this!)
const sql = `SELECT * FROM users WHERE email = '${email}'`;
await connection.query(sql);
```

### Error Handling

The repositories provide descriptive error messages:

- **Duplicate email**: "User with email {email} already exists"
- **User not found**: "User with ID {userId} not found"
- **Database errors**: "Failed to {operation}: {error message}"

### Data Validation

- Email uniqueness enforced by database constraint
- Foreign key constraints ensure referential integrity
- UUID validation for user IDs
- Proper type conversion for dates

## Testing

### Unit Tests

The repositories are tested with integration tests that require a running PostgreSQL database.

**Running Integration Tests:**

```bash
# Set environment variables
export SKIP_INTEGRATION_TESTS=false
export TEST_DB_HOST=localhost
export TEST_DB_PORT=5432
export TEST_DB_NAME=halloween_test
export TEST_DB_USER=postgres
export TEST_DB_PASSWORD=your_password

# Run tests
npm test -- PostgresUserRepository.integration.test.ts
npm test -- PostgresTestResultRepository.integration.test.ts
```

**Test Coverage:**

PostgresUserRepository:
- ✅ Create user with valid email
- ✅ Prevent duplicate email creation
- ✅ Find user by email
- ✅ Return null for non-existent email
- ✅ Update last login timestamp
- ✅ SQL injection prevention
- ✅ Concurrent operations
- ✅ Error handling

PostgresTestResultRepository:
- ✅ Create test result
- ✅ Create results for all character types
- ✅ Find results by user ID
- ✅ Return results in reverse chronological order
- ✅ Handle non-existent users
- ✅ SQL injection prevention
- ✅ Concurrent operations
- ✅ Cascade deletion
- ✅ Error handling

## Usage with Service Factory

The repositories are automatically instantiated by the ServiceFactory based on feature flags:

```typescript
import { ServiceFactory } from '../ServiceFactory';

// In advanced mode (ENABLE_EMAIL_AUTH=true)
const factory = ServiceFactory.getInstance();
const userRepository = factory.getUserRepository(); // Returns PostgresUserRepository
const resultRepository = factory.getTestResultRepository(); // Returns PostgresTestResultRepository

// In simple mode (ENABLE_EMAIL_AUTH=false)
const userRepository = factory.getUserRepository(); // Returns NoOpUserRepository
const resultRepository = factory.getTestResultRepository(); // Returns NoOpTestResultRepository
```

## Performance Considerations

### Connection Pooling

The repositories use the PostgresConnection class which implements connection pooling:

- Default pool size: 20 connections
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds
- Automatic retry logic for transient errors

### Indexing

The database schema includes indexes for optimal query performance:

- `idx_users_email` - Fast email lookups
- `idx_test_results_user_id` - Fast user result lookups
- `idx_test_results_completed_at` - Fast chronological sorting

### Query Optimization

- Uses `RETURNING` clause to avoid extra SELECT queries
- Efficient date handling with PostgreSQL's `NOW()` function
- Proper use of indexes for WHERE and ORDER BY clauses

## Error Scenarios

### Common Errors and Solutions

**Error: "User with email {email} already exists"**
- Cause: Attempting to create a user with an email that already exists
- Solution: Check if user exists before creating, or handle the error

**Error: "User with ID {userId} not found"**
- Cause: Attempting to create a test result for a non-existent user
- Solution: Ensure user exists before creating test results

**Error: "Failed to find user by email: {error}"**
- Cause: Database connection issue or query error
- Solution: Check database connection and logs

**Error: "invalid input syntax for type uuid"**
- Cause: Invalid UUID format provided
- Solution: Validate UUID format before calling repository methods

## Migration Guide

To use these repositories in your application:

1. **Run database migrations:**
   ```bash
   npm run migrate:up
   ```

2. **Configure database connection:**
   ```bash
   # .env file
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=halloween_test
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

3. **Enable advanced mode:**
   ```bash
   # .env file
   ENABLE_EMAIL_AUTH=true
   ```

4. **Use via ServiceFactory:**
   ```typescript
   import { ServiceFactory } from './services/ServiceFactory';
   
   const factory = ServiceFactory.getInstance();
   const userRepo = factory.getUserRepository();
   const resultRepo = factory.getTestResultRepository();
   ```

## Best Practices

1. **Always use parameterized queries** - Never concatenate user input into SQL strings
2. **Handle errors gracefully** - Catch and log errors, provide user-friendly messages
3. **Use transactions for related operations** - Use `connection.getClient()` for multi-step operations
4. **Close connections properly** - Call `connection.end()` during application shutdown
5. **Test with real database** - Run integration tests before deploying
6. **Monitor connection pool** - Use `connection.getPoolStats()` for monitoring

## Related Documentation

- [PostgresConnection README](./PostgresConnection.README.md) - Database connection implementation
- [Service Factory README](../ServiceFactory.README.md) - Dependency injection system
- [Migration Guide](../../database/MIGRATION_GUIDE.md) - Database migration instructions
