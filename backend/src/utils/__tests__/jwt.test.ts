import jwt from 'jsonwebtoken';
import {
  generateToken,
  verifyToken,
  refreshToken,
  decodeTokenUnsafe,
  getTokenExpiration,
  isTokenExpired,
  JWTPayload,
} from '../jwt';

// Mock environment variables
const originalEnv = process.env;

describe('JWT Utilities', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
      JWT_EXPIRES_IN: '1h',
      NODE_ENV: 'test',
    };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should include userId and email in token payload', () => {
      const payload = {
        userId: 'user-456',
        email: 'user@test.com',
      };

      const token = generateToken(payload);
      const decoded = jwt.decode(token) as JWTPayload;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should include iat (issued at) and exp (expiration) claims', () => {
      const payload = {
        userId: 'user-789',
        email: 'another@test.com',
      };

      const token = generateToken(payload);
      const decoded = jwt.decode(token) as JWTPayload;

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat!);
    });

    it('should throw error if token generation fails', () => {
      // Force an error by using invalid secret
      const originalSign = jwt.sign;
      jwt.sign = jest.fn(() => {
        throw new Error('Signing failed');
      });

      expect(() => {
        generateToken({ userId: 'test', email: 'test@test.com' });
      }).toThrow('Failed to generate JWT token');

      jwt.sign = originalSign;
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow('Invalid token');
    });

    it('should throw error for expired token', async () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      // Generate token that's already expired (negative expiration)
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: -1 }
      );
      
      expect(() => {
        verifyToken(token);
      }).toThrow(); // Will throw either 'Token has expired' or 'Invalid token'
    });

    it('should throw error for token with wrong secret', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      // Generate token with different secret
      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });

      expect(() => {
        verifyToken(token);
      }).toThrow('Invalid token');
    });

    it('should throw error for token missing required fields', () => {
      // Generate token without required fields
      const token = jwt.sign(
        { someField: 'value' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      expect(() => {
        verifyToken(token);
      }).toThrow('Invalid token');
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => {
        verifyToken(malformedToken);
      }).toThrow('Invalid token');
    });
  });

  describe('refreshToken', () => {
    it('should generate a new token with same payload', async () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const originalToken = generateToken(payload);
      
      // Wait a moment to ensure different iat
      await new Promise((resolve) => setTimeout(resolve, 1100));
      
      const refreshedToken = refreshToken(originalToken);

      expect(refreshedToken).toBeDefined();
      expect(refreshedToken).not.toBe(originalToken);

      const originalDecoded = jwt.decode(originalToken) as JWTPayload;
      const refreshedDecoded = jwt.decode(refreshedToken) as JWTPayload;

      expect(refreshedDecoded.userId).toBe(originalDecoded.userId);
      expect(refreshedDecoded.email).toBe(originalDecoded.email);
      expect(refreshedDecoded.iat).toBeGreaterThan(originalDecoded.iat!);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        refreshToken(invalidToken);
      }).toThrow('Failed to refresh token');
    });

    it('should throw error for expired token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      // Generate expired token
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: -1 }
      );
      
      expect(() => {
        refreshToken(token);
      }).toThrow('Failed to refresh token');
    });
  });

  describe('decodeTokenUnsafe', () => {
    it('should decode a valid token without verification', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);
      const decoded = decodeTokenUnsafe(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
    });

    it('should decode expired token without throwing', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: -1 }
      );
      
      const decoded = decodeTokenUnsafe(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
    });

    it('should decode token with wrong secret without throwing', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
      const decoded = decodeTokenUnsafe(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const decoded = decodeTokenUnsafe(malformedToken);

      expect(decoded).toBeNull();
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration timestamp for valid token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);
      const exp = getTokenExpiration(token);

      expect(exp).not.toBeNull();
      expect(typeof exp).toBe('number');
      expect(exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const exp = getTokenExpiration(invalidToken);

      expect(exp).toBeNull();
    });

    it('should return expiration for expired token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: -1 }
      );

      const exp = getTokenExpiration(token);
      expect(exp).not.toBeNull();
      expect(typeof exp).toBe('number');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid non-expired token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);
      const expired = isTokenExpired(token);

      expect(expired).toBe(false);
    });

    it('should return true for expired token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: -1 }
      );
      
      const expired = isTokenExpired(token);
      expect(expired).toBe(true);
    });

    it('should return true for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const expired = isTokenExpired(invalidToken);

      expect(expired).toBe(true);
    });

    it('should return true for token without expiration', () => {
      // Create token without expiration
      const token = jwt.sign(
        { userId: 'user-123', email: 'test@example.com' },
        process.env.JWT_SECRET!
      );

      const expired = isTokenExpired(token);
      expect(expired).toBe(true);
    });
  });

  describe('Token payload structure', () => {
    it('should maintain consistent payload structure', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      // Check all expected fields are present
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');

      // Check types
      expect(typeof decoded.userId).toBe('string');
      expect(typeof decoded.email).toBe('string');
      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
    });
  });

  describe('Configuration validation', () => {
    it('should use JWT_SECRET from environment', () => {
      const customSecret = 'custom-secret-key-that-is-at-least-32-characters-long';
      process.env.JWT_SECRET = customSecret;

      // Need to reload module to pick up new env var
      jest.resetModules();
      const jwtModule = require('../jwt');

      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = jwtModule.generateToken(payload);
      
      // Verify with custom secret
      const decoded = jwt.verify(token, customSecret) as JWTPayload;
      expect(decoded.userId).toBe(payload.userId);
    });

    it('should use JWT_EXPIRES_IN from environment', () => {
      process.env.JWT_EXPIRES_IN = '2h';

      jest.resetModules();
      const jwtModule = require('../jwt');

      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = jwtModule.generateToken(payload);
      const decoded = jwt.decode(token) as JWTPayload;

      // Check that expiration is approximately 2 hours from now
      const now = Math.floor(Date.now() / 1000);
      const twoHours = 2 * 60 * 60;
      
      expect(decoded.exp).toBeGreaterThan(now + twoHours - 10);
      expect(decoded.exp).toBeLessThan(now + twoHours + 10);
    });
  });
});
