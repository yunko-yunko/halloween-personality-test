# Service Factory and Dependency Injection

## Overview

The `ServiceFactory` provides a centralized way to create and manage service instances based on feature flags. It implements the singleton pattern to ensure consistent service instances across the application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ServiceFactory                          │
│  (Singleton - creates services based on feature flags)     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─── Feature Flag Check
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│   Simple Mode    │                  │  Advanced Mode   │
│ (emailAuth=false)│                  │ (emailAuth=true) │
└──────────────────┘                  └──────────────────┘
        │                                       │
        ├─ NoOpEmailService                    ├─ SESEmailService
        ├─ NoOpUserRepository                  ├─ PostgresUserRepository
        └─ NoOpTestResultRepository            └─ PostgresTestResultRepository
```

## Usage

### In Express App

```typescript
import express from 'express';
import { injectServices } from './middleware';

const app = express();

// Apply service injection middleware globally
app.use(injectServices);

// Now all routes have access to req.services
app.post('/api/test/submit', (req, res) => {
  const { testResultRepository } = req.services!;
  // Use services...
});
```

### In Controllers

```typescript
import { Request, Response } from 'express';

export async function submitTest(req: Request, res: Response) {
  // Services are automatically injected by middleware
  const { testResultRepository, emailService } = req.services!;
  
  // Use services for business logic
  const result = await testResultRepository.create({
    userId: req.user?.userId || 'anonymous',
    characterType: 'zombie',
    mbtiType: 'EST',
  });
  
  if (req.user) {
    await emailService.sendResultEmail(req.user.email, result.characterType);
  }
  
  res.json({ result });
}
```

### Direct Access (Not Recommended)

```typescript
import { ServiceFactory } from './services/ServiceFactory';

// Get services directly (use only when middleware is not available)
const services = ServiceFactory.getServices();
const { emailService } = services;
```

## Feature Flag Behavior

### Simple Mode (ENABLE_EMAIL_AUTH=false)

When `ENABLE_EMAIL_AUTH` is `false` or not set, the factory returns no-op implementations:

- **NoOpEmailService**: Logs email operations instead of sending
- **NoOpUserRepository**: Returns mock data without database persistence
- **NoOpTestResultRepository**: Returns mock results without database persistence

This mode is perfect for:
- Development without AWS setup
- Testing without external dependencies
- Quick prototyping
- Users who want immediate access without registration

### Advanced Mode (ENABLE_EMAIL_AUTH=true)

When `ENABLE_EMAIL_AUTH` is `true`, the factory returns real implementations:

- **SESEmailService**: Sends emails via AWS SES
- **PostgresUserRepository**: Persists users to PostgreSQL database
- **PostgresTestResultRepository**: Persists test results to PostgreSQL database

This mode requires:
- AWS SES configuration
- PostgreSQL database setup
- Environment variables for credentials

**Note**: Advanced mode implementations will be added in Phase 8-9. Currently, enabling advanced mode will throw an error with instructions.

## Testing

### Unit Tests with Mock Services

```typescript
import { ServiceFactory } from '../services/ServiceFactory';

describe('MyController', () => {
  beforeEach(() => {
    // Create mock services
    const mockServices = {
      emailService: {
        sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
        sendResultEmail: jest.fn().mockResolvedValue(undefined),
      },
      userRepository: {
        findByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: '123', email: 'test@example.com' }),
        updateLastLogin: jest.fn().mockResolvedValue(undefined),
      },
      testResultRepository: {
        create: jest.fn().mockResolvedValue({ id: '456', characterType: 'zombie' }),
        findByUserId: jest.fn().mockResolvedValue([]),
      },
    };
    
    // Inject mock services for testing
    ServiceFactory.createCustomContainer(mockServices);
  });
  
  afterEach(() => {
    // Reset to default behavior
    ServiceFactory.reset();
  });
  
  it('should use mock services', async () => {
    const services = ServiceFactory.getServices();
    await services.emailService.sendVerificationEmail('test@example.com', 'token');
    
    expect(services.emailService.sendVerificationEmail).toHaveBeenCalledWith(
      'test@example.com',
      'token'
    );
  });
});
```

### Integration Tests with Real No-Op Services

```typescript
describe('Integration Test', () => {
  beforeEach(() => {
    process.env.ENABLE_EMAIL_AUTH = 'false';
    ServiceFactory.reset();
  });
  
  it('should use no-op services in simple mode', () => {
    const services = ServiceFactory.getServices();
    
    // These will log but not throw errors
    await services.emailService.sendVerificationEmail('test@example.com', 'token');
    const user = await services.userRepository.create('test@example.com');
    
    expect(user.email).toBe('test@example.com');
  });
});
```

## Service Interfaces

All services implement well-defined interfaces, allowing for easy swapping of implementations:

### IEmailService

```typescript
interface IEmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendResultEmail(email: string, character: HalloweenCharacter): Promise<void>;
}
```

### IUserRepository

```typescript
interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(email: string): Promise<User>;
  updateLastLogin(userId: string): Promise<void>;
}
```

### ITestResultRepository

```typescript
interface ITestResultRepository {
  create(result: TestResultInput): Promise<TestResult>;
  findByUserId(userId: string): Promise<TestResult[]>;
}
```

## Singleton Pattern

The ServiceFactory uses the singleton pattern to ensure:

1. **Consistency**: Same service instances across the application
2. **Performance**: Services are created once and reused
3. **State Management**: Services can maintain internal state if needed

```typescript
// These will return the same instances
const services1 = ServiceFactory.getServices();
const services2 = ServiceFactory.getServices();

console.log(services1 === services2); // true
```

To reset the singleton (useful for testing):

```typescript
ServiceFactory.reset();
```

## Error Handling

### Service Initialization Errors

If service initialization fails, the middleware will catch the error and return a 500 response:

```json
{
  "code": "SERVICE_INITIALIZATION_ERROR",
  "message": "Advanced mode (ENABLE_EMAIL_AUTH=true) is not yet implemented..."
}
```

### Service Operation Errors

Individual service operations should handle their own errors:

```typescript
try {
  await emailService.sendVerificationEmail(email, token);
} catch (error) {
  console.error('Failed to send email:', error);
  // Handle error appropriately
}
```

## Future Extensibility

The service abstraction layer allows for easy changes to infrastructure:

### Swapping Email Providers

```typescript
// Current: AWS SES
class SESEmailService implements IEmailService { ... }

// Future: SendGrid
class SendGridEmailService implements IEmailService { ... }

// Future: Mailgun
class MailgunEmailService implements IEmailService { ... }
```

### Swapping Databases

```typescript
// Current: PostgreSQL
class PostgresUserRepository implements IUserRepository { ... }

// Future: Aurora
class AuroraUserRepository implements IUserRepository { ... }

// Future: DynamoDB
class DynamoDBUserRepository implements IUserRepository { ... }
```

### Adding API Gateway Layer

```typescript
// Future: API Gateway + Lambda
class APIGatewayUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    // Call API Gateway endpoint
    const response = await fetch(`${API_URL}/users?email=${email}`);
    return response.json();
  }
}
```

## Best Practices

1. **Use Middleware**: Always use `injectServices` middleware instead of direct factory access
2. **Don't Instantiate**: Never create service instances manually in controllers
3. **Test with Mocks**: Use `createCustomContainer()` for testing with mock services
4. **Reset After Tests**: Always call `ServiceFactory.reset()` in test cleanup
5. **Handle Errors**: Wrap service calls in try-catch blocks
6. **Check Feature Flags**: Be aware of which mode you're running in
7. **Document Dependencies**: Clearly document which services a controller uses

## Requirements Satisfied

This implementation satisfies the following requirements:

- **4.2**: Feature flag controls authentication features
- **4.3**: System adjusts routing and UI based on feature flag
- **4.5**: Core functionality works identically regardless of feature flag
- **10.4**: Application initializes with injected implementations based on configuration
- **10.7**: Simple mode uses no-op implementations that don't persist data
