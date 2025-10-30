import {
  generateVerificationToken,
  calculateTokenExpiration,
  isTokenExpired,
  isValidTokenFormat,
  TOKEN_EXPIRATION_MS,
} from '../tokenUtils';

describe('tokenUtils', () => {
  describe('generateVerificationToken', () => {
    it('should generate a valid UUID v4 token', () => {
      const token = generateVerificationToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(isValidTokenFormat(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('calculateTokenExpiration', () => {
    it('should calculate expiration date 24 hours in the future by default', () => {
      const now = Date.now();
      const expiresAt = calculateTokenExpiration();
      const expectedExpiration = now + TOKEN_EXPIRATION_MS;
      
      // Allow 1 second tolerance for test execution time
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiration + 1000);
    });

    it('should calculate expiration with custom duration', () => {
      const customDuration = 60 * 60 * 1000; // 1 hour
      const now = Date.now();
      const expiresAt = calculateTokenExpiration(customDuration);
      const expectedExpiration = now + customDuration;
      
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiration + 1000);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for future expiration date', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      expect(isTokenExpired(futureDate)).toBe(false);
    });

    it('should return true for past expiration date', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      expect(isTokenExpired(pastDate)).toBe(true);
    });

    it('should return true for current time (edge case)', () => {
      const now = new Date();
      // Wait a tiny bit to ensure time has passed
      setTimeout(() => {
        expect(isTokenExpired(now)).toBe(true);
      }, 10);
    });
  });

  describe('isValidTokenFormat', () => {
    it('should return true for valid UUID v4 format', () => {
      const validTokens = [
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
      ];

      validTokens.forEach((token) => {
        expect(isValidTokenFormat(token)).toBe(true);
      });
    });

    it('should return false for invalid UUID format', () => {
      const invalidTokens = [
        'not-a-uuid',
        '12345',
        '',
        '550e8400-e29b-11d4-a716-446655440000', // UUID v1, not v4
        '550e8400-e29b-21d4-a716-446655440000', // UUID v2, not v4
        'g50e8400-e29b-41d4-a716-446655440000', // Invalid character
        '550e8400-e29b-41d4-a716', // Too short
      ];

      invalidTokens.forEach((token) => {
        expect(isValidTokenFormat(token)).toBe(false);
      });
    });

    it('should be case insensitive', () => {
      const token = '550E8400-E29B-41D4-A716-446655440000';
      expect(isValidTokenFormat(token)).toBe(true);
    });
  });
});
