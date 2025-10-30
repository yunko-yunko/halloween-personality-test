# Service Implementations

This directory contains concrete implementations of service interfaces for both simple and advanced modes.

## No-Op Implementations (Simple Mode)

When `ENABLE_EMAIL_AUTH=false`, the application uses no-op implementations that log operations without persisting data or sending emails.

### NoOpUserRepository

- **Purpose**: Provides user repository interface without database persistence
- **Behavior**:
  - `findByEmail()`: Always returns `null`
  - `create()`: Returns mock user object without saving to database
  - `updateLastLogin()`: Logs operation without updating database
- **Use Case**: Simple mode where no user accounts are needed

### NoOpTestResultRepository

- **Purpose**: Provides test result repository interface without database persistence
- **Behavior**:
  - `create()`: Returns mock test result without saving to database
  - `findByUserId()`: Always returns empty array
- **Use Case**: Simple mode where test results are not stored

### NoOpEmailService

- **Purpose**: Provides email service interface without sending actual emails
- **Behavior**:
  - `sendVerificationEmail()`: Logs email details to console
  - `sendResultEmail()`: Logs email details to console
- **Use Case**: Simple mode where email verification is not required

## Real Implementations (Advanced Mode)

When `ENABLE_EMAIL_AUTH=true`, the application will use real implementations:

- **PostgresUserRepository**: Stores users in PostgreSQL database
- **PostgresTestResultRepository**: Stores test results in PostgreSQL database
- **SESEmailService**: Sends emails via AWS SES

These implementations will be created in later tasks.

## Usage

The service factory (to be implemented in task 10) will automatically select the appropriate implementations based on the feature flag:

```typescript
import { features } from '../config/features';
import { NoOpUserRepository } from './implementations';
import { PostgresUserRepository } from './implementations';

const userRepository = features.emailAuth 
  ? new PostgresUserRepository(dbConnection)
  : new NoOpUserRepository();
```

## Testing

All implementations include comprehensive unit tests to verify:
- Interface compliance
- Correct behavior for simple mode
- Proper logging
- No side effects (no persistence, no external calls)

Run tests with:
```bash
npm test -- NoOp
```
