# JWT Utilities Documentation

## Overview

This module provides JWT (JSON Web Token) utilities for session management in the Halloween Personality Test application. It includes functions for generating, verifying, and refreshing JWT tokens used for user authentication in advanced mode.

## Configuration

JWT utilities are configured via environment variables:

```bash
# Required in production
JWT_SECRET=your-jwt-secret-key-min-32-characters-long

# Optional - defaults to 24h
JWT_EXPIRES_IN=24h
```

### Security Requirements

- `JWT_SECRET` must be at least 32 characters for security
- In production, the module will throw an error if using the default secret
- Tokens are signed using HS256 algorithm by default

## Token Payload Structure

All JWT tokens contain the following payload:

```typescript
interface JWTPayload {
  userId: string;      // User's unique identifier
  email: string;       // User's email address
  iat?: number;        // Issued at timestamp (added automatically)
  exp?: number;        // Expiration timestamp (added automatically)
}
```

## Functions

### generateToken(payload)

Generates a new JWT token for a user session.

**Parameters:**
- `payload`: Object containing `userId` and `email`

**Returns:** 
- JWT token string

**Example:**
```typescript
import { generateToken } from './utils/jwt';

const token = generateToken({
  userId: 'user-123',
  email: 'user@example.com'
});

// Set token in HTTP-only cookie
res.cookie('session_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});
```

**Throws:**
- Error if token generation fails

---

### verifyToken(token)

Verifies and decodes a JWT token, ensuring it's valid and not expired.

**Parameters:**
- `token`: JWT token string to verify

**Returns:** 
- Decoded `JWTPayload` object

**Example:**
```typescript
import { verifyToken } from './utils/jwt';

try {
  const payload = verifyToken(token);
  console.log(`User ${payload.email} authenticated`);
  // Proceed with authenticated request
} catch (error) {
  console.error('Authentication failed:', error.message);
  // Return 401 Unauthorized
}
```

**Throws:**
- `"Token has expired"` - Token expiration time has passed
- `"Invalid token"` - Token is malformed, has wrong signature, or missing required fields
- `"Failed to verify token: ..."` - Other verification errors

---

### refreshToken(token)

Refreshes a JWT token by generating a new one with the same payload but extended expiration.

**Parameters:**
- `token`: Existing JWT token to refresh

**Returns:** 
- New JWT token string with extended expiration

**Example:**
```typescript
import { refreshToken } from './utils/jwt';

try {
  const newToken = refreshToken(oldToken);
  // Update cookie with new token
  res.cookie('session_token', newToken, { /* cookie options */ });
} catch (error) {
  console.error('Token refresh failed:', error.message);
  // Require re-authentication
}
```

**Throws:**
- Error if the original token is invalid or expired

**Note:** This is optional functionality. The current implementation requires the original token to be valid (not expired) to refresh it.

---

### decodeTokenUnsafe(token)

Decodes a JWT token without verifying its signature or expiration.

**Parameters:**
- `token`: JWT token string to decode

**Returns:** 
- Decoded `JWTPayload` object or `null` if invalid

**Example:**
```typescript
import { decodeTokenUnsafe } from './utils/jwt';

const payload = decodeTokenUnsafe(token);
if (payload) {
  console.log('Token was issued for:', payload.email);
  console.log('Token issued at:', new Date(payload.iat! * 1000));
}
```

**⚠️ WARNING:** Do not use this function for authentication! Always use `verifyToken()` for security-critical operations. This function is useful for:
- Debugging
- Extracting information from expired tokens
- Logging and analytics

---

### getTokenExpiration(token)

Gets the expiration timestamp of a token without verifying it.

**Parameters:**
- `token`: JWT token string

**Returns:** 
- Expiration timestamp (seconds since epoch) or `null` if invalid

**Example:**
```typescript
import { getTokenExpiration } from './utils/jwt';

const exp = getTokenExpiration(token);
if (exp) {
  const expirationDate = new Date(exp * 1000);
  console.log('Token expires at:', expirationDate);
}
```

---

### isTokenExpired(token)

Checks if a token is expired without verifying its signature.

**Parameters:**
- `token`: JWT token string

**Returns:** 
- `true` if token is expired or invalid, `false` otherwise

**Example:**
```typescript
import { isTokenExpired } from './utils/jwt';

if (isTokenExpired(token)) {
  console.log('Token has expired, please re-authenticate');
  // Redirect to login
} else {
  console.log('Token is still valid');
}
```

## Usage in Authentication Middleware

Here's how to use JWT utilities in Express middleware:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { features } from '../config/features';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Skip authentication in simple mode
  if (!features.emailAuth) {
    return next();
  }
  
  // Get token from cookie
  const token = req.cookies.session_token;
  
  if (!token) {
    return res.status(401).json({ 
      error: '인증이 필요합니다.' 
    });
  }
  
  try {
    // Verify token
    const payload = verifyToken(token);
    
    // Attach user info to request
    req.user = payload;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: error instanceof Error ? error.message : '인증에 실패했습니다.' 
    });
  }
}
```

## Usage in Authentication Routes

```typescript
import { generateToken } from '../utils/jwt';

// After successful email verification
export async function verifyTokenHandler(req: Request, res: Response) {
  try {
    // ... verify email token ...
    
    // Create or retrieve user
    const user = await userRepository.findByEmail(email);
    
    // Generate JWT session token
    const sessionToken = generateToken({
      userId: user.id,
      email: user.email
    });
    
    // Set HTTP-only cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

## Security Best Practices

1. **Always use HTTPS in production** - Set `secure: true` on cookies
2. **Use HTTP-only cookies** - Prevents XSS attacks from stealing tokens
3. **Set SameSite attribute** - Prevents CSRF attacks
4. **Keep secrets secure** - Never commit JWT_SECRET to version control
5. **Use strong secrets** - Minimum 32 characters, randomly generated
6. **Set appropriate expiration** - Balance security and user experience
7. **Validate payload** - Always check required fields are present
8. **Handle errors gracefully** - Don't expose internal error details to clients

## Testing

Comprehensive unit tests are available in `__tests__/jwt.test.ts`. Run tests with:

```bash
npm test -- jwt.test.ts
```

Tests cover:
- Token generation and verification
- Expiration handling
- Invalid token handling
- Token refresh functionality
- Payload structure validation
- Configuration validation

## Related Requirements

This implementation satisfies the following requirements from the spec:
- **Requirement 9.3**: Session management with JWT tokens
- **Requirement 9.4**: Token expiration and validation

## Future Enhancements

Potential improvements for future versions:
- Token blacklisting for logout
- Refresh token rotation
- Multiple device session management
- Token revocation on password change
- Rate limiting on token generation
