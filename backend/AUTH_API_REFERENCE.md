# Authentication API Reference

## Overview
The authentication system provides email-based verification for user access. It supports both new user registration and returning user login through a unified email verification flow.

## Base URL
```
/api/auth
```

## Endpoints

### 1. Send Verification Email

**Endpoint:** `POST /api/auth/send-verification`

**Description:** Sends a verification email with a unique token to the provided email address. If the user already has pending tokens, they are deleted before creating a new one.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Validation:**
- Email must be a valid email format
- Email is required

**Success Response (200):**
```json
{
  "success": true,
  "message": "인증 이메일이 전송되었습니다. 이메일을 확인해주세요."
}
```

**Error Responses:**

**400 Bad Request** - Invalid email format:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "유효하지 않은 이메일 주소입니다.",
  "errors": [
    {
      "field": "email",
      "message": "유효하지 않은 이메일 주소입니다."
    }
  ]
}
```

**403 Forbidden** - Feature disabled:
```json
{
  "code": "FEATURE_DISABLED",
  "message": "이메일 인증 기능이 비활성화되어 있습니다."
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

### 2. Verify Token

**Endpoint:** `GET /api/auth/verify-token`

**Description:** Verifies the email verification token and creates or retrieves the user account. Sets a session cookie upon successful verification.

**Query Parameters:**
- `token` (required): The verification token from the email link

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2025-10-13T12:00:00.000Z",
    "updatedAt": "2025-10-13T12:00:00.000Z"
  },
  "message": "인증이 완료되었습니다."
}
```

**Cookies Set:**
- `session_token`: JWT token containing user ID and email
  - HttpOnly: true
  - Secure: true (in production)
  - SameSite: Strict
  - Max-Age: 24 hours (86400000 ms)

**Error Responses:**

**400 Bad Request** - Missing token:
```json
{
  "code": "INVALID_REQUEST",
  "message": "인증 토큰이 필요합니다."
}
```

**400 Bad Request** - Invalid token format:
```json
{
  "code": "VERIFICATION_FAILED",
  "message": "유효하지 않은 인증 링크입니다."
}
```

**400 Bad Request** - Token already used:
```json
{
  "code": "VERIFICATION_FAILED",
  "message": "이미 사용된 인증 링크입니다."
}
```

**400 Bad Request** - Token expired:
```json
{
  "code": "VERIFICATION_FAILED",
  "message": "인증 링크가 만료되었습니다. 다시 시도해주세요."
}
```

**403 Forbidden** - Feature disabled:
```json
{
  "code": "FEATURE_DISABLED",
  "message": "이메일 인증 기능이 비활성화되어 있습니다."
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/auth/verify-token?token=550e8400-e29b-41d4-a716-446655440000" \
  -c cookies.txt
```

---

### 3. Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Clears the session cookie, effectively logging out the user.

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "로그아웃되었습니다."
}
```

**Cookies Cleared:**
- `session_token`: Removed

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## Authentication Flow

### New User Flow
```
1. User enters email → POST /api/auth/send-verification
2. System generates token and sends email
3. User clicks link in email → GET /api/auth/verify-token?token=xxx
4. System creates new user account
5. System sets session cookie
6. User is authenticated
```

### Returning User Flow
```
1. User enters email → POST /api/auth/send-verification
2. System generates token and sends email
3. User clicks link in email → GET /api/auth/verify-token?token=xxx
4. System retrieves existing user account
5. System updates last login timestamp
6. System sets session cookie
7. User is authenticated
```

### Logout Flow
```
1. User clicks logout → POST /api/auth/logout
2. System clears session cookie
3. User is logged out
```

## Security Features

### Token Security
- **UUID v4 format**: Cryptographically secure random tokens
- **24-hour expiration**: Tokens expire after 24 hours
- **One-time use**: Tokens are marked as used after verification
- **Automatic cleanup**: Old tokens are deleted when sending new verification

### Cookie Security
- **HttpOnly**: Prevents JavaScript access to cookies
- **Secure**: HTTPS-only in production
- **SameSite=Strict**: Prevents CSRF attacks
- **24-hour expiration**: Matches JWT token expiration

### JWT Token
- **Payload**: Contains user ID and email
- **Expiration**: 24 hours
- **Secret**: Configurable via JWT_SECRET environment variable
- **Algorithm**: HS256 (HMAC with SHA-256)

## Environment Variables

```bash
# Feature Flag
ENABLE_EMAIL_AUTH=true

# JWT Configuration
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# Frontend URL (for CORS)
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com

# Email Service (AWS SES)
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@your-domain.com
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halloween_test
DB_USER=postgres
DB_PASSWORD=password
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed (invalid email, missing fields) |
| `INVALID_REQUEST` | Malformed request (missing token parameter) |
| `VERIFICATION_FAILED` | Token verification failed (invalid, expired, or used) |
| `FEATURE_DISABLED` | Email authentication feature is disabled |
| `SERVICE_INITIALIZATION_ERROR` | Service dependency injection failed |

## Rate Limiting

**Note:** Rate limiting is not yet implemented but should be added to prevent:
- Email spam (limit verification emails per email address)
- Token brute force attacks (limit verification attempts per IP)

**Recommended limits:**
- 3 verification emails per email address per hour
- 10 verification attempts per IP per hour

## Testing

Run authentication route tests:
```bash
npm test -- authRoutes.test.ts
```

All 19 tests should pass:
- Email verification flow tests (5)
- Token verification tests (8)
- Logout tests (2)
- Complete flow tests (2)
- Security tests (2)

## Integration with Frontend

### Send Verification
```typescript
// Frontend code example
const sendVerification = async (email: string) => {
  const response = await fetch('/api/auth/send-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};
```

### Verify Token
```typescript
// Frontend code example
const verifyToken = async (token: string) => {
  const response = await fetch(`/api/auth/verify-token?token=${token}`, {
    method: 'GET',
    credentials: 'include', // Important: Include cookies
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};
```

### Logout
```typescript
// Frontend code example
const logout = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include', // Important: Include cookies
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};
```

## Troubleshooting

### Issue: "Feature disabled" error
**Solution:** Set `ENABLE_EMAIL_AUTH=true` in your `.env` file

### Issue: Cookies not being set
**Solution:** Ensure `credentials: 'include'` is set in fetch requests and CORS is properly configured

### Issue: Token expired immediately
**Solution:** Check that server and client clocks are synchronized

### Issue: Email not being sent
**Solution:** Verify AWS SES credentials and that the sender email is verified in SES

### Issue: "Invalid token" error
**Solution:** Ensure the token is a valid UUID v4 format and hasn't been used or expired
