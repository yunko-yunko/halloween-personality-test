import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * JWT Token Payload Structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT Configuration
 */
const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-key-for-development-only';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Validates that JWT_SECRET is properly configured in production
 */
function validateJWTConfig(): void {
  if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'default-secret-key-for-development-only') {
    throw new Error('JWT_SECRET must be configured in production environment');
  }
  
  if (JWT_SECRET.length < 32) {
    console.warn('Warning: JWT_SECRET should be at least 32 characters for security');
  }
}

// Validate configuration on module load
validateJWTConfig();

/**
 * Generates a JWT token for a user session
 * 
 * @param payload - User information to encode in the token
 * @returns Signed JWT token string
 * 
 * @example
 * const token = generateToken({ userId: '123', email: 'user@example.com' });
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN as any,
      }
    );
    
    return token;
  } catch (error) {
    throw new Error(`Failed to generate JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verifies and decodes a JWT token
 * 
 * @param token - JWT token string to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid, expired, or malformed
 * 
 * @example
 * try {
 *   const payload = verifyToken(token);
 *   console.log(payload.userId, payload.email);
 * } catch (error) {
 *   console.error('Invalid token');
 * }
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Ensure required fields are present
    if (!decoded.userId || !decoded.email) {
      throw new jwt.JsonWebTokenError('Invalid token payload: missing required fields');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error(`Failed to verify token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Refreshes a JWT token by generating a new one with the same payload
 * This is optional functionality for extending user sessions
 * 
 * @param token - Existing JWT token to refresh
 * @returns New JWT token with extended expiration
 * @throws Error if the original token is invalid
 * 
 * @example
 * const newToken = refreshToken(oldToken);
 */
export function refreshToken(token: string): string {
  try {
    // Verify the existing token (will throw if invalid)
    const decoded = verifyToken(token);
    
    // Generate a new token with the same payload
    return generateToken({
      userId: decoded.userId,
      email: decoded.email,
    });
  } catch (error) {
    throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decodes a JWT token without verifying its signature
 * Useful for debugging or extracting information from expired tokens
 * WARNING: Do not use for authentication - always use verifyToken() instead
 * 
 * @param token - JWT token string to decode
 * @returns Decoded token payload or null if invalid
 * 
 * @example
 * const payload = decodeTokenUnsafe(token);
 * if (payload) {
 *   console.log('Token was issued for:', payload.email);
 * }
 */
export function decodeTokenUnsafe(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the expiration time of a token in seconds since epoch
 * 
 * @param token - JWT token string
 * @returns Expiration timestamp or null if token is invalid
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = decodeTokenUnsafe(token);
  return decoded?.exp || null;
}

/**
 * Checks if a token is expired without verifying signature
 * 
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  if (!exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return exp < now;
}
