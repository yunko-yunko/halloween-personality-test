import { Request, Response, NextFunction } from 'express';
import { ServiceContainer } from '../services/ServiceFactory';
import { AuthService } from '../services/AuthService';
import { features } from '../config/features';

/**
 * Authentication Controller
 * Handles email verification, token validation, and session management
 * Delegates business logic to AuthService
 */
export class AuthController {
  /**
   * POST /api/auth/send-verification
   * Send verification email with token
   */
  async sendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if email auth is enabled
      if (!features.emailAuth) {
        res.status(403).json({
          code: 'FEATURE_DISABLED',
          message: '이메일 인증 기능이 비활성화되어 있습니다.',
        });
        return;
      }

      const { email } = req.body;
      const services = req.services as ServiceContainer;

      // Create AuthService instance
      const authService = new AuthService(
        services.emailService,
        services.userRepository,
        services.verificationTokenRepository
      );

      // Send verification email
      await authService.sendVerification(email);

      res.status(200).json({
        success: true,
        message: '인증 이메일이 전송되었습니다. 이메일을 확인해주세요.',
      });
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error && error.message.includes('유효하지 않은')) {
        res.status(400).json({
          code: 'INVALID_EMAIL',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * GET /api/auth/verify-token
   * Verify token, create/retrieve user, and set session cookie
   */
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if email auth is enabled
      if (!features.emailAuth) {
        res.status(403).json({
          code: 'FEATURE_DISABLED',
          message: '이메일 인증 기능이 비활성화되어 있습니다.',
        });
        return;
      }

      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          code: 'INVALID_REQUEST',
          message: '인증 토큰이 필요합니다.',
        });
        return;
      }

      const services = req.services as ServiceContainer;

      // Create AuthService instance
      const authService = new AuthService(
        services.emailService,
        services.userRepository,
        services.verificationTokenRepository
      );

      // Verify token and get/create user
      const user = await authService.verifyToken(token);

      // Create session token
      const sessionToken = authService.createSession(user);

      // Set HTTP-only cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('session_token', sessionToken, {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        message: '인증이 완료되었습니다.',
      });
    } catch (error) {
      // Handle specific error messages from token validation
      if (error instanceof Error) {
        res.status(400).json({
          code: 'VERIFICATION_FAILED',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Clear session cookie
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear the session cookie
      res.clearCookie('session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        message: '로그아웃되었습니다.',
      });
    } catch (error) {
      next(error);
    }
  }
}
