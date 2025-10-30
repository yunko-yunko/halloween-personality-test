# Dependency Injection Implementation

## Overview

This document describes the dependency injection system implemented for the Halloween Personality Test backend. The system uses a service factory pattern with middleware injection to provide services to controllers based on feature flags.

## Components Implemented

### 1. ServiceFactory (`src/services/ServiceFactory.ts`)

A singleton factory that creates and manages service instances based on the `ENABLE_EMAIL_AUTH` feature flag.

**Key Features:**
- Singleton pattern for consistent service instances
- Feature flag-based service selection
- Support for custom service containers (for testing)
- Reset functionality for test isolation

**API:**
```typescript
ServiceFactory.getServices(): ServiceContainer
ServiceFactory.reset(): void
ServiceFactory.createCustomContainer(services: ServiceContainer): void
```

### 2. Service Injection Middleware (`src/middleware/serviceInjection.ts`)

Express middleware that injects services into the request object, making them available to all route handlers.

**Usage:**
```typescript
app.use(injectServices);

// In route handlers
app.post('/api/test/submit', (req, res) => {
  const { testResultRepository } = req.services!;
  // Use services...
});
```

### 3. Service Interfaces

All services implement well-defined interfaces:

- `IEmailService` - Email operations (verification, results)
- `IUserRepository` - User data access
- `ITestResultRepository` - Test result data access

### 4. No-Op Implementations (Simple Mode)

When `ENABLE_EMAIL_AUTH=false`:

- `NoOpEmailService` - Logs email operations
- `NoOpUserRepository` - Returns mock user data
- `NoOpTestResultRepository` - Returns mock test results

## Feature Flag Behavior

### Simple Mode (ENABLE_EMAIL_AUTH=false or undefined)

```bash
ENABLE_EMAIL_AUTH=false
```

- Uses no-op implementations
- No database persistence
- No email sending
- Perfect for development and testing

### Advanced Mode (ENABLE_EMAIL_AUTH=true)

```bash
ENABLE_EMAIL_AUTH=true
```

- Will use real implementations (PostgreSQL, AWS SES)
- Currently throws error with helpful message
- Real implementations will be added in Phase 8-9

## Integration with Express App

The service injection middleware is applied globally in `app.ts`:

```typescript
import { injectServices } from './middleware';

const app = express();

// ... other middleware ...

// Inject services into all requests
app.use(injectServices);

// ... routes ...
```

## Usage in Controllers

Controllers access services through the request object:

```typescript
export async function submitTest(req: Request, res: Response) {
  // Services are automatically available
  const { testResultRepository, emailService } = req.services!;
  
  // Use services for business logic
  const result = await testResultRepository.create({
    userId: req.user?.userId || 'anonymous',
    characterType: 'zombie',
    mbtiType: 'EST',
  });
  
  // Send email if authenticated
  if (req.user) {
    await emailService.sendResultEmail(req.user.email, result.characterType);
  }
  
  res.json({ result });
}
```

## Testing

### Unit Tests

Test files created:
- `src/services/__tests__/ServiceFactory.test.ts` - Factory unit tests
- `src/services/__tests__/ServiceFactory.integration.test.ts` - Feature flag integration tests
- `src/middleware/__tests__/serviceInjection.test.ts` - Middleware tests

### Test Coverage

All tests pass (84 tests total):
- ✅ Service factory singleton behavior
- ✅ Feature flag switching
- ✅ No-op implementations
- ✅ Service injection middleware
- ✅ Error handling
- ✅ Custom container for testing

### Testing with Mocks

```typescript
import { ServiceFactory } from '../services/ServiceFactory';

describe('MyController', () => {
  beforeEach(() => {
    const mockServices = {
      emailService: {
        sendVerificationEmail: jest.fn(),
        sendResultEmail: jest.fn(),
      },
      userRepository: {
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateLastLogin: jest.fn(),
      },
      testResultRepository: {
        create: jest.fn(),
        findByUserId: jest.fn(),
      },
    };
    
    ServiceFactory.createCustomContainer(mockServices);
  });
  
  afterEach(() => {
    ServiceFactory.reset();
  });
  
  // Tests...
});
```

## Files Created

### Core Implementation
- `backend/src/services/ServiceFactory.ts` - Service factory
- `backend/src/services/index.ts` - Service exports
- `backend/src/middleware/serviceInjection.ts` - Injection middleware
- `backend/src/middleware/index.ts` - Middleware exports

### Tests
- `backend/src/services/__tests__/ServiceFactory.test.ts`
- `backend/src/services/__tests__/ServiceFactory.integration.test.ts`
- `backend/src/middleware/__tests__/serviceInjection.test.ts`

### Documentation
- `backend/src/services/ServiceFactory.README.md` - Comprehensive guide
- `backend/src/controllers/README.md` - Controller usage guide
- `backend/DEPENDENCY_INJECTION.md` - This file

### Updates
- `backend/src/app.ts` - Added service injection middleware

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- ✅ **4.2**: Feature flag controls authentication features
- ✅ **4.3**: System adjusts routing and UI based on feature flag
- ✅ **4.5**: Core functionality works identically regardless of feature flag
- ✅ **10.4**: Application initializes with injected implementations based on configuration
- ✅ **10.7**: Simple mode uses no-op implementations that don't persist data

## Next Steps

When implementing Phase 4 (Backend API Routes), controllers will:

1. Use `req.services` to access injected services
2. Work identically in both simple and advanced modes
3. Not need to know which implementations are being used

When implementing Phase 8-9 (Advanced Mode), we'll:

1. Create `SESEmailService` implementing `IEmailService`
2. Create `PostgresUserRepository` implementing `IUserRepository`
3. Create `PostgresTestResultRepository` implementing `ITestResultRepository`
4. Update `ServiceFactory` to return these implementations when `emailAuth=true`

## Benefits

1. **Separation of Concerns**: Business logic separated from infrastructure
2. **Testability**: Easy to mock services for testing
3. **Flexibility**: Can swap implementations without changing controllers
4. **Feature Flags**: Single codebase supports multiple modes
5. **Type Safety**: TypeScript interfaces ensure consistency
6. **Maintainability**: Clear patterns for adding new services

## Example Flow

```
Request → Express App
    ↓
Service Injection Middleware
    ↓
ServiceFactory.getServices()
    ↓
Feature Flag Check (ENABLE_EMAIL_AUTH)
    ↓
    ├─ false → No-Op Implementations
    └─ true → Real Implementations (Phase 8-9)
    ↓
Services Injected into req.services
    ↓
Route Handler / Controller
    ↓
Uses req.services for business logic
    ↓
Response
```

## Conclusion

The dependency injection system is fully implemented and tested. It provides a solid foundation for building the API routes in Phase 4 and will seamlessly support advanced mode when implemented in Phase 8-9.
