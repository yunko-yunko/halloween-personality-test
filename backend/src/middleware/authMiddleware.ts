import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { features } from '../config/features';
import { AppError, errorMessages } from './errorHandler';

/**
 * Authentication middleware that checks for valid JWT in cookies
 * 
 * This middleware:
 * - Skips authentication check when feature flag is disabled
 * - Validates JWT token from cookies
 * - Attaches user info to request object when authenticated
 * - Returns 401 error for invalid/missing tokens
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @example
 * // Protect a route with authentication
 * router.get('/profile', requireAuth, profileController.getProfile);
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Skip authentication check when feature flag is disabled
    if (!features.emailAuth) {
      return next();
    }

    // Extract token from cookies
    const token = req.cookies?.session_token;

    // Check if token exists
    if (!token) {
      throw new AppError(
        'UNAUTHORIZED',
        errorMessages.UNAUTHORIZED,
        401
      );
    }

    // Verify and decode the token
    try {
      const decoded = verifyToken(token);

      // Attach user info to request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };

      // Proceed to next middleware/route handler
      next();
    } catch (error) {
      // Handle token verification errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('expired')) {
        throw new AppError(
          'TOKEN_EXPIRED',
          errorMessages.TOKEN_EXPIRED,
          401
        );
      } else {
        throw new AppError(
          'TOKEN_INVALID',
          errorMessages.TOKEN_INVALID,
          401
        );
      }
    }
  } catch (error) {
    // Pass error to error handling middleware
    next(error);
  }
};

/**
 * Optional authentication middleware that attaches user info if token exists
 * but doesn't require authentication
 * 
 * This is useful for routes that behave differently for authenticated users
 * but are still accessible to unauthenticated users
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Skip if feature flag is disabled
    if (!features.emailAuth) {
      return next();
    }

    // Extract token from cookies
    const token = req.cookies?.session_token;

    // If no token, just continue without authentication
    if (!token) {
      return next();
    }

    // Try to verify token, but don't fail if invalid
    try {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      // Token is invalid, but we don't fail - just continue without user
      console.log('Optional auth: Invalid token, continuing without authentication');
    }

    next();
  } catch (error) {
    // Pass unexpected errors to error handling middleware
    next(error);
  }
};
