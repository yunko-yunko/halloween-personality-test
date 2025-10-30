import { Request, Response, NextFunction } from 'express';
import { requireAuth, optionalAuth } from '../authMiddleware';
import { generateToken } from '../../utils/jwt';
import { AppError } from '../errorHandler';

// Mock the features config
jest.mock('../../config/features', () => ({
  features: {
    emailAuth: true, // Default to enabled for tests
  },
}));

// Import features after mocking
import { features } from '../../config/features';

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      cookies: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    
    // Reset feature flag to enabled
    (features as any).emailAuth = true;
  });

  describe('requireAuth', () => {
    describe('when feature flag is disabled', () => {
      it('should skip authentication and call next()', () => {
        // Disable feature flag
        (features as any).emailAuth = false;

        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockRequest.user).toBeUndefined();
      });

      it('should not check for token when feature flag is disabled', () => {
        // Disable feature flag
        (features as any).emailAuth = false;
        mockRequest.cookies = {}; // No token

        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockRequest.user).toBeUndefined();
      });
    });

    describe('when feature flag is enabled', () => {
      it('should return 401 error when no token is provided', () => {
        mockRequest.cookies = {}; // No token

        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            statusCode: 401,
          })
        );
      });

      it('should return 401 error when cookies object is undefined', () => {
        mockRequest.cookies = undefined;

        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            statusCode: 401,
          })
        );
      });

      it('should attach user info to request when valid token is provided', () => {
        const userId = 'user-123';
        const email = 'test@example.com';
        const token = generateToken({ userId, email });

        mockRequest.cookies = { session_token: token };

        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRequest.user).toEqual({
          userId,
          email,
        });
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should return 401 error for invalid token', () => {
        mockRequest.cookies = { session_token: 'invalid-token' };

        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'TOKEN_INVALID',
            statusCode: 401,
          })
        );
      });

      it('should return 401 error for malformed token', () => {
        mockRequest.cookies = { session_token: 'not.a.jwt' };

        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'TOKEN_INVALID',
            statusCode: 401,
          })
        );
      });

      it('should return 401 error with TOKEN_EXPIRED code for expired token', (done) => {
        // Create a token that expires in 1 second
        const jwt = require('jsonwebtoken');
        const expiredToken = jwt.sign(
          { userId: 'user-123', email: 'test@example.com' },
          process.env.JWT_SECRET || 'default-secret-key-for-development-only',
          { expiresIn: '1ms' }
        );

        mockRequest.cookies = { session_token: expiredToken };

        // Wait for token to expire
        setTimeout(() => {
          requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              code: 'TOKEN_EXPIRED',
              statusCode: 401,
            })
          );
          done();
        }, 100);
      });

      it('should handle multiple valid tokens correctly', () => {
        const user1 = { userId: 'user-1', email: 'user1@example.com' };
        const user2 = { userId: 'user-2', email: 'user2@example.com' };

        const token1 = generateToken(user1);
        const token2 = generateToken(user2);

        // First request
        mockRequest.cookies = { session_token: token1 };
        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockRequest.user).toEqual(user1);

        // Second request with different token
        mockRequest = { cookies: { session_token: token2 } };
        mockNext = jest.fn();
        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockRequest.user).toEqual(user2);
      });

      it('should not modify request object when token is invalid', () => {
        mockRequest.cookies = { session_token: 'invalid-token' };
        const originalRequest = { ...mockRequest };

        requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRequest.user).toBeUndefined();
      });
    });
  });

  describe('optionalAuth', () => {
    describe('when feature flag is disabled', () => {
      it('should skip authentication and call next()', () => {
        (features as any).emailAuth = false;

        optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockRequest.user).toBeUndefined();
      });
    });

    describe('when feature flag is enabled', () => {
      it('should call next() without error when no token is provided', () => {
        mockRequest.cookies = {};

        optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockRequest.user).toBeUndefined();
      });

      it('should attach user info when valid token is provided', () => {
        const userId = 'user-123';
        const email = 'test@example.com';
        const token = generateToken({ userId, email });

        mockRequest.cookies = { session_token: token };

        optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRequest.user).toEqual({
          userId,
          email,
        });
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should call next() without error when invalid token is provided', () => {
        mockRequest.cookies = { session_token: 'invalid-token' };

        optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockRequest.user).toBeUndefined();
      });

      it('should not throw error for expired token', (done) => {
        const jwt = require('jsonwebtoken');
        const expiredToken = jwt.sign(
          { userId: 'user-123', email: 'test@example.com' },
          process.env.JWT_SECRET || 'default-secret-key-for-development-only',
          { expiresIn: '1ms' }
        );

        mockRequest.cookies = { session_token: expiredToken };

        setTimeout(() => {
          optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

          expect(mockNext).toHaveBeenCalledWith();
          expect(mockRequest.user).toBeUndefined();
          done();
        }, 100);
      });

      it('should handle cookies being undefined', () => {
        mockRequest.cookies = undefined;

        optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockRequest.user).toBeUndefined();
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work in a middleware chain', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const token = generateToken({ userId, email });

      mockRequest.cookies = { session_token: token };

      // Simulate middleware chain
      const middleware1 = jest.fn((req, res, next) => next());
      const middleware2 = requireAuth;
      const middleware3 = jest.fn((req, res, next) => {
        expect(req.user).toEqual({ userId, email });
        next();
      });

      middleware1(mockRequest, mockResponse, () => {
        middleware2(mockRequest as Request, mockResponse as Response, () => {
          middleware3(mockRequest, mockResponse, mockNext);
        });
      });

      expect(middleware1).toHaveBeenCalled();
      expect(middleware3).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should stop middleware chain on authentication failure', () => {
      mockRequest.cookies = { session_token: 'invalid-token' };

      const nextMiddleware = jest.fn();

      requireAuth(mockRequest as Request, mockResponse as Response, (error) => {
        expect(error).toBeInstanceOf(AppError);
        expect(nextMiddleware).not.toHaveBeenCalled();
      });
    });
  });
});
