# Controllers

## Overview
Controllers handle HTTP requests and responses. They use services injected via middleware to perform business logic.

## Service Injection Pattern

Services are automatically injected into the request object via the `injectServices` middleware. Controllers access services through `req.services`.

### Example Controller

```typescript
import { Request, Response } from 'express';

export class TestController {
  /**
   * Submit test answers and get result
   * Services are injected via middleware
   */
  async submitTest(req: Request, res: Response): Promise<void> {
    try {
      const { answers } = req.body;
      
      // Access services from request object
      const { testResultRepository, emailService } = req.services!;
      
      // Use services for business logic
      const result = await testResultRepository.create({
        userId: req.user?.userId || 'anonymous',
        characterType: 'zombie',
        mbtiType: 'EST',
      });
      
      // Send email if user is authenticated
      if (req.user) {
        await emailService.sendResultEmail(req.user.email, result.characterType);
      }
      
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit test' });
    }
  }
}
```

## Service Availability

### Simple Mode (ENABLE_EMAIL_AUTH=false)
- `emailService`: NoOpEmailService (logs instead of sending)
- `userRepository`: NoOpUserRepository (returns mock data)
- `testResultRepository`: NoOpTestResultRepository (doesn't persist)

### Advanced Mode (ENABLE_EMAIL_AUTH=true)
- `emailService`: SESEmailService (sends via AWS SES)
- `userRepository`: PostgresUserRepository (persists to RDS)
- `testResultRepository`: PostgresTestResultRepository (persists to RDS)

## Best Practices

1. **Always check for services**: Use `req.services!` or check if defined
2. **Handle errors**: Wrap service calls in try-catch blocks
3. **Don't instantiate services**: Use injected services from request
4. **Test with mocks**: Use `ServiceFactory.createCustomContainer()` for testing

## Testing Controllers

```typescript
import { ServiceFactory } from '../services/ServiceFactory';

describe('TestController', () => {
  beforeEach(() => {
    // Create mock services
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
    
    // Inject mock services
    ServiceFactory.createCustomContainer(mockServices);
  });
  
  afterEach(() => {
    ServiceFactory.reset();
  });
  
  it('should submit test', async () => {
    // Test implementation
  });
});
```
