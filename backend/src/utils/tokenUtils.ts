import { randomUUID } from 'crypto';

/**
 * Token expiration time in milliseconds (24 hours)
 */
export const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a secure verification token using crypto UUID
 * @returns A unique token string
 */
export function generateVerificationToken(): string {
  return randomUUID();
}

/**
 * Calculate expiration date for a token
 * @param expirationMs - Expiration time in milliseconds (default: 24 hours)
 * @returns Date object representing when the token expires
 */
export function calculateTokenExpiration(expirationMs: number = TOKEN_EXPIRATION_MS): Date {
  return new Date(Date.now() + expirationMs);
}

/**
 * Check if a token has expired
 * @param expiresAt - The expiration date of the token
 * @returns true if the token has expired, false otherwise
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Validate token format (UUID v4)
 * @param token - The token to validate
 * @returns true if the token format is valid, false otherwise
 */
export function isValidTokenFormat(token: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(token);
}
