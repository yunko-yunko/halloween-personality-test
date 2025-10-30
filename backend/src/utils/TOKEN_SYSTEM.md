# Verification Token System

This document describes the verification token generation and validation system used for email authentication in the Halloween Personality Test application.

## Overview

The token system provides secure email verification using UUID v4 tokens with expiration and single-use enforcement. It supports both simple mode (no-op) and advanced mode (PostgreSQL storage).

## Components

### 1. Token Utilities (`tokenUtils.ts`)

Core utility functions for token generation and validation:

- **`generateVerificationToken()`**: Generates a secure UUID v4 token using Node.js crypto
- **`calculateTokenExpiration()`**: Calculates expiration date (default: 24 hours)
- **`isTokenExpired()`**: Checks if a token has expired
- **`isValidTokenFormat()`**: Validates UUID v4 format

### 2. Verification Token Repository Interface

Abstraction layer for token storage:

```typescript
interface IVerificationTokenRepository {
  create(email: string, token: string, expiresAt: Date): Promise<VerificationToken>;
  findByToken(token: string): Promise<VerificationToken | null>;
  markAsUsed(token: string): Promise<void>;
  deleteExpiredTokens(): Promise<number>;
  deleteByEmail(email: string): Promise<number>;
}
```

**Implementations:**
- `PostgresVerificationTokenRepository`: Stores tokens in PostgreSQL database
- `NoOpVerificationTokenRepository`: No-op implementation for simple mode

### 3. Verification Token Service

High-level service for token management:

```typescript
class VerificationTokenService {
  generateToken(email: string): Promise<{ token: string; expiresAt: Date }>;
  validateToken(token: string): Promise<VerificationToken>;
  markTokenAsUsed(token: string): Promise<void>;
  cleanupExpiredTokens(): Promise<number>;
  startCleanupJob(intervalMs?: number): void;
  stopCleanupJob(): void;
}
```

## Token Lifecycle

### 1. Generation

```typescript
const service = new VerificationTokenService(tokenRepository);
const { token, expiresAt } = await service.generateToken('user@example.com');
```

- Generates a secure UUID v4 token
- Calculates expiration date (24 hours from now)
- Deletes any existing tokens for the email
- Stores the new token in the database

### 2. Validation

```typescript
try {
  const verificationToken = await service.validateToken(token);
  // Token is valid, proceed with verification
} catch (error) {
  // Handle error (invalid format, expired, already used, not found)
}
```

Validation checks:
1. Token format is valid UUID v4
2. Token exists in database
3. Token has not been used
4. Token has not expired

### 3. Usage

```typescript
await service.markTokenAsUsed(token);
```

Marks the token as used to prevent reuse.

### 4. Cleanup

Expired tokens are automatically cleaned up:

```typescript
// Start automatic cleanup (runs every hour by default)
service.startCleanupJob();

// Manual cleanup
const deletedCount = await service.cleanupExpiredTokens();

// Stop automatic cleanup
service.stopCleanupJob();
```

## Database Schema

```sql
CREATE TABLE verification_tokens (
  token VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_tokens_email ON verification_tokens(email);
CREATE INDEX idx_verification_tokens_expires_at ON verification_tokens(expires_at);
CREATE INDEX idx_verification_tokens_used_expires ON verification_tokens(used, expires_at);
```

## Error Messages (Korean)

The system provides user-friendly error messages in Korean:

- **Invalid format**: "유효하지 않은 인증 링크입니다."
- **Token not found**: "유효하지 않은 인증 링크입니다."
- **Already used**: "이미 사용된 인증 링크입니다."
- **Expired**: "인증 링크가 만료되었습니다. 다시 시도해주세요."

## Security Features

1. **UUID v4 tokens**: Cryptographically secure random tokens
2. **Expiration**: Tokens expire after 24 hours
3. **Single-use**: Tokens can only be used once
4. **Automatic cleanup**: Expired tokens are automatically deleted
5. **Email isolation**: Each email can only have one active token at a time

## Usage Example

```typescript
import { ServiceFactory } from './services/ServiceFactory';
import { VerificationTokenService } from './services/VerificationTokenService';

// Get services from factory (automatically uses correct implementation based on feature flag)
const { verificationTokenRepository } = ServiceFactory.getServices();

// Create token service
const tokenService = new VerificationTokenService(verificationTokenRepository);

// Start automatic cleanup job
tokenService.startCleanupJob();

// Generate token for email verification
const { token, expiresAt } = await tokenService.generateToken('user@example.com');

// Send email with verification link containing the token
await emailService.sendVerificationEmail('user@example.com', token);

// Later, when user clicks the link...
try {
  const verificationToken = await tokenService.validateToken(token);
  
  // Token is valid, create/retrieve user
  const user = await userRepository.findByEmail(verificationToken.email);
  
  // Mark token as used
  await tokenService.markTokenAsUsed(token);
  
  // Create session for user
  // ...
} catch (error) {
  // Display error message to user
  console.error('Token validation failed:', error.message);
}
```

## Testing

The token system includes comprehensive unit and integration tests:

- **`tokenUtils.test.ts`**: Tests for utility functions
- **`VerificationTokenService.test.ts`**: Tests for service logic
- **`PostgresVerificationTokenRepository.test.ts`**: Tests for database operations

Run tests:
```bash
npm test -- tokenUtils.test.ts
npm test -- VerificationTokenService.test.ts
npm test -- PostgresVerificationTokenRepository.test.ts
```

## Configuration

Token expiration can be configured:

```typescript
// Default: 24 hours
const { token, expiresAt } = await service.generateToken(email);

// Custom expiration (1 hour)
import { calculateTokenExpiration } from './utils/tokenUtils';
const customExpiration = calculateTokenExpiration(60 * 60 * 1000);
```

Cleanup job interval can be configured:

```typescript
// Default: 1 hour
service.startCleanupJob();

// Custom interval: 30 minutes
service.startCleanupJob(30 * 60 * 1000);
```

## Feature Flag Support

The token system respects the `ENABLE_EMAIL_AUTH` feature flag:

- **Simple mode** (`ENABLE_EMAIL_AUTH=false`): Uses `NoOpVerificationTokenRepository`
- **Advanced mode** (`ENABLE_EMAIL_AUTH=true`): Uses `PostgresVerificationTokenRepository`

The ServiceFactory automatically provides the correct implementation based on the feature flag.
