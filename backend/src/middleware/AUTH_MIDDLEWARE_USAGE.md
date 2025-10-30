# Authentication Middleware Usage Guide

## Overview

The authentication middleware provides JWT-based authentication for protected routes. It includes two middleware functions:

1. `requireAuth` - Requires valid authentication, returns 401 if not authenticated
2. `optionalAuth` - Attaches user info if authenticated, but doesn't require it

## Features

- ✅ Validates JWT tokens from HTTP-only cookies
- ✅ Respects feature flags (skips auth when `ENABLE_EMAIL_AUTH=false`)
- ✅ Attaches user info to request object
- ✅ Returns Korean error messages
- ✅ Handles expired and invalid tokens appropriately

## Usage Examples

### Protecting a Route (Required Authentication)

```typescript
import { Router } from 'express';
import { requireAuth } from '../middleware';
import { profileController } from '../controllers/profileController';

const router = Router();

// This route requires authentication
router.get('/profile/me', requireAuth, profileController.getProfile);
router.get('/profile/history', requireAuth, profileController.getHistory);

export default router;
```

### Optional Authentication

```typescript
import { Router } from 'express';
import { optionalAuth } from '../middleware';
import { testController } from '../controllers/testController';

const router = Router();

// This route works for both authenticated and unauthenticated users
// but behaves differently based on authentication status
router.post('/test/submit', optionalAuth, testController.submitTest);

export default router;
```

### Accessing User Info in Controllers

```typescript
import { Request, Response } from 'express';

export class ProfileController {
  async getProfile(req: Request, res: Response) {
    // User info is attached by requireAuth middleware
    const { userId, email } = req.user!; // Non-null assertion safe here
    
    // Fetch user profile using userId
    const profile = await this.userService.getProfile(userId);
    
    res.json({ profile });
  }
}
```

### Conditional Behavior Based on Authentication

```typescript
import { Request, Response } from 'express';

export class TestController {
  async submitTest(req: Request, res: Response) {
    const { answers } = req.body;
    
    // Calculate result
    const result = this.scoringService.calculateResult(answers);
    
    // If user is authenticated (optionalAuth attached user info)
    if (req.user) {
      // Save result to database
      await this.resultRepository.create({
        userId: req.user.userId,
        ...result
      });
      
      // Send result email
      await this.emailService.sendResultEmail(req.user.email, result);
    }
    
    // Return result regardless of authentication
    res.json({ result });
  }
}
```

## Feature Flag Behavior

### When `ENABLE_EMAIL_AUTH=false` (Simple Mode)

```typescript
// Both middleware functions skip authentication entirely
router.get('/profile', requireAuth, handler); // Handler executes without auth check
router.post('/test', optionalAuth, handler);  // Handler executes without auth check
```

### When `ENABLE_EMAIL_AUTH=true` (Advanced Mode)

```typescript
// requireAuth enforces authentication
router.get('/profile', requireAuth, handler); // Returns 401 if not authenticated

// optionalAuth attaches user if present
router.post('/test', optionalAuth, handler);  // Executes with or without auth
```

## Error Responses

### Missing Token (requireAuth only)

```json
{
  "code": "UNAUTHORIZED",
  "message": "인증이 필요합니다.",
  "statusCode": 401
}
```

### Invalid Token

```json
{
  "code": "TOKEN_INVALID",
  "message": "유효하지 않은 인증 링크입니다.",
  "statusCode": 401
}
```

### Expired Token

```json
{
  "code": "TOKEN_EXPIRED",
  "message": "인증 링크가 만료되었습니다. 다시 시도해주세요.",
  "statusCode": 401
}
```

## Request Object Extension

The middleware extends the Express Request object with user information:

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}
```

## Testing

Comprehensive tests are available in `__tests__/authMiddleware.test.ts`:

- ✅ Feature flag behavior (enabled/disabled)
- ✅ Valid token handling
- ✅ Invalid token handling
- ✅ Expired token handling
- ✅ Missing token handling
- ✅ Middleware chain integration
- ✅ Both requireAuth and optionalAuth scenarios

Run tests:
```bash
npm test -- authMiddleware.test.ts
```

## Security Considerations

1. **HTTP-Only Cookies**: Tokens should be stored in HTTP-only cookies (set by backend)
2. **Token Expiration**: Tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN`)
3. **Secure Flag**: In production, cookies should have the `Secure` flag set
4. **SameSite**: Cookies should use `SameSite=Strict` to prevent CSRF

## Related Files

- `src/utils/jwt.ts` - JWT token generation and verification
- `src/middleware/errorHandler.ts` - Error handling and Korean messages
- `src/config/features.ts` - Feature flag configuration
- `src/types/index.ts` - TypeScript type definitions
