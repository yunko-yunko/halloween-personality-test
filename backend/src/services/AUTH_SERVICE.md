# AuthService

The `AuthService` class encapsulates all authentication business logic for the Halloween Personality Test application. It handles email verification, user creation/retrieval, and session management.

## Overview

The AuthService provides a clean abstraction layer for authentication operations, separating business logic from HTTP request handling. It uses dependency injection to work with email services, user repositories, and verification token repositories.

## Architecture

```
AuthController (HTTP Layer)
    ↓
AuthService (Business Logic)
    ↓
├── IEmailService (Email operations)
├── IUserRepository (User data access)
└── IVerificationTokenRepository (Token storage)
```

## Dependencies

The AuthService requires three service interfaces:

1. **IEmailService**: Sends verification and result emails
2. **IUserRepository**: Manages user data (create, find, update)
3. **IVerificationTokenRepository**: Manages verification tokens

## Usage

### Creating an Instance

```typescript
import { AuthService } from '../services/AuthService';
import { ServiceContainer } from '../services/ServiceFactory';

const services = req.services as ServiceContainer;

const authService = new AuthService(
  services.emailService,
  services.userRepository,
  services.verificationTokenRepository
);
```

### Methods

#### sendVerification(email: string): Promise<void>

Sends a verification email to the specified email address.

**Parameters:**
- `email` (string): The email address to send verification to

**Throws:**
- `Error`: "유효하지 않은 이메일 주소입니다." - Invalid email format
- `Error`: "이메일 전송에 실패했습니다. 다시 시도해주세요." - Email sending failed

**Example:**
```typescript
try {
  await authService.sendVerification('user@example.com');
  console.log('Verification email sent successfully');
} catch (error) {
  console.error('Failed to send verification:', error.message);
}
```

**Process:**
1. Validates email format
2. Generates a unique verification token (UUID v4)
3. Deletes any existing tokens for the email
4. Stores the new token in the database
5. Sends verification email via IEmailService

---

#### verifyToken(token: string): Promise<User>

Verifies a token and returns the associated user. Creates a new user if they don't exist, or updates the last login timestamp for existing users.

**Parameters:**
- `token` (string): The verification token to validate (UUID v4 format)

**Returns:**
- `Promise<User>`: The user object

**Throws:**
- `Error`: "유효하지 않은 인증 링크입니다." - Invalid token format or not found
- `Error`: "인증 링크가 만료되었습니다. 다시 시도해주세요." - Token expired
- `Error`: "이미 사용된 인증 링크입니다." - Token already used
- `Error`: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." - Database error

**Example:**
```typescript
try {
  const user = await authService.verifyToken('550e8400-e29b-41d4-a716-446655440000');
  console.log('User verified:', user.email);
} catch (error) {
  console.error('Token verification failed:', error.message);
}
```

**Process:**
1. Validates token format (UUID v4)
2. Checks if token exists in database
3. Validates token hasn't been used
4. Validates token hasn't expired
5. Checks if user exists by email
6. Creates new user OR updates last login
7. Marks token as used
8. Returns user object

---

#### createSession(user: User): string

Creates a JWT session token for an authenticated user.

**Parameters:**
- `user` (User): The user to create a session for

**Returns:**
- `string`: JWT token string

**Throws:**
- `Error`: "세션 생성에 실패했습니다. 다시 시도해주세요." - JWT generation failed

**Example:**
```typescript
try {
  const sessionToken = authService.createSession(user);
  // Set this token in an HTTP-only cookie
  res.cookie('session_token', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
} catch (error) {
  console.error('Session creation failed:', error.message);
}
```

**Process:**
1. Generates JWT token with user ID and email
2. Sets expiration time (24 hours by default)
3. Returns signed token

---

## Complete Authentication Flow

### New User Registration

```typescript
// Step 1: User enters email
const email = 'newuser@example.com';
await authService.sendVerification(email);
// → User receives email with verification link

// Step 2: User clicks verification link
const token = '550e8400-e29b-41d4-a716-446655440000'; // From URL
const user = await authService.verifyToken(token);
// → New user created in database

// Step 3: Create session
const sessionToken = authService.createSession(user);
// → User is logged in
```

### Returning User Login

```typescript
// Step 1: User enters email
const email = 'existinguser@example.com';
await authService.sendVerification(email);
// → User receives email with verification link

// Step 2: User clicks verification link
const token = '550e8400-e29b-41d4-a716-446655440000'; // From URL
const user = await authService.verifyToken(token);
// → Last login timestamp updated

// Step 3: Create session
const sessionToken = authService.createSession(user);
// → User is logged in
```

## Error Handling

The AuthService provides user-friendly error messages in Korean. All errors should be caught and handled appropriately in the controller layer.

### Error Types

| Error Message | Cause | HTTP Status |
|--------------|-------|-------------|
| 유효하지 않은 이메일 주소입니다. | Invalid email format | 400 |
| 이메일 전송에 실패했습니다. 다시 시도해주세요. | Email service failure | 500 |
| 유효하지 않은 인증 링크입니다. | Invalid token format or not found | 400 |
| 인증 링크가 만료되었습니다. 다시 시도해주세요. | Token expired (>24 hours) | 400 |
| 이미 사용된 인증 링크입니다. | Token already used | 400 |
| 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요. | Database error | 500 |
| 세션 생성에 실패했습니다. 다시 시도해주세요. | JWT generation error | 500 |

### Example Error Handling in Controller

```typescript
try {
  await authService.sendVerification(email);
  res.status(200).json({ message: 'Success' });
} catch (error) {
  if (error instanceof Error && error.message.includes('유효하지 않은')) {
    res.status(400).json({ code: 'INVALID_EMAIL', message: error.message });
  } else {
    res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
  }
}
```

## Testing

The AuthService is fully unit tested with mocked dependencies. See `__tests__/AuthService.test.ts` for comprehensive test coverage.

### Running Tests

```bash
npm test -- AuthService.test.ts
```

### Test Coverage

- ✅ Email validation (valid and invalid formats)
- ✅ Token generation and storage
- ✅ Email sending (success and failure)
- ✅ Token verification (valid, invalid, expired, used)
- ✅ New user creation
- ✅ Existing user login
- ✅ Session token generation
- ✅ Complete authentication flows
- ✅ Error handling for all failure scenarios

## Security Considerations

1. **Email Validation**: Validates email format before processing
2. **Token Format**: Uses UUID v4 for secure, unpredictable tokens
3. **Token Expiration**: Tokens expire after 24 hours
4. **Single Use**: Tokens can only be used once
5. **Token Cleanup**: Old tokens are automatically deleted when new ones are generated
6. **JWT Security**: Session tokens are signed and have expiration
7. **Error Messages**: Generic error messages for security-sensitive operations

## Integration with Controllers

The AuthService is designed to be used in controllers. Here's how it integrates with the AuthController:

```typescript
// In AuthController
import { AuthService } from '../services/AuthService';

async sendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const services = req.services as ServiceContainer;
    
    const authService = new AuthService(
      services.emailService,
      services.userRepository,
      services.verificationTokenRepository
    );
    
    await authService.sendVerification(email);
    
    res.status(200).json({
      success: true,
      message: '인증 이메일이 전송되었습니다. 이메일을 확인해주세요.',
    });
  } catch (error) {
    // Handle errors appropriately
    next(error);
  }
}
```

## Feature Flag Support

The AuthService works seamlessly with the feature flag system. When `ENABLE_EMAIL_AUTH=false`, the service layer uses no-op implementations that don't persist data or send emails.

```typescript
// Feature flag check happens in controller
if (!features.emailAuth) {
  res.status(403).json({ message: 'Feature disabled' });
  return;
}

// AuthService uses injected implementations
// - Simple mode: NoOpEmailService, NoOpUserRepository
// - Advanced mode: SESEmailService, PostgresUserRepository
```

## Related Documentation

- [Service Factory](./ServiceFactory.README.md) - Dependency injection and service creation
- [JWT Utilities](../utils/JWT_UTILITIES.md) - JWT token generation and verification
- [Token System](../utils/TOKEN_SYSTEM.md) - Verification token management
- [Auth Middleware](../middleware/AUTH_MIDDLEWARE_USAGE.md) - Request authentication

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **6.2**: Send verification email via email service interface
- **6.3**: Generate unique verification link
- **6.4**: Verify token and grant access
- **6.5**: Handle invalid/expired tokens
- **6.6**: Create or retrieve user session
- **9.1**: Email-based login for returning users
- **9.2**: Authenticate user via verification link
- **9.5**: Handle new user registration vs returning user login
