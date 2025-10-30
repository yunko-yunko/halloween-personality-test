import { Request, Response, NextFunction } from 'express';
import { ServiceContainer } from '../services/ServiceFactory';
import { features } from '../config/features';
import { AppError, errorMessages } from '../middleware/errorHandler';

/**
 * Profile Controller
 * Handles user profile and test history retrieval
 * Protected by requireAuth middleware
 */
export class ProfileController {
  /**
   * GET /api/profile/me
   * Return current user info
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if email auth is enabled
      if (!features.emailAuth) {
        res.status(403).json({
          code: 'FEATURE_DISABLED',
          message: '프로필 기능이 비활성화되어 있습니다.',
        });
        return;
      }

      // User should be attached by requireAuth middleware
      if (!req.user) {
        throw new AppError(
          'UNAUTHORIZED',
          errorMessages.UNAUTHORIZED,
          401
        );
      }

      const services = req.services as ServiceContainer;
      const { email } = req.user;

      // Fetch user from repository
      const user = await services.userRepository.findByEmail(email);

      if (!user) {
        throw new AppError(
          'USER_NOT_FOUND',
          '사용자를 찾을 수 없습니다.',
          404
        );
      }

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/history
   * Return all test results for user in reverse chronological order
   * Optional pagination support via query params: ?page=1&limit=10
   */
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if email auth is enabled
      if (!features.emailAuth) {
        res.status(403).json({
          code: 'FEATURE_DISABLED',
          message: '테스트 기록 기능이 비활성화되어 있습니다.',
        });
        return;
      }

      // User should be attached by requireAuth middleware
      if (!req.user) {
        throw new AppError(
          'UNAUTHORIZED',
          errorMessages.UNAUTHORIZED,
          401
        );
      }

      const services = req.services as ServiceContainer;
      const { userId } = req.user;

      // Get pagination parameters (optional)
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = (page - 1) * limit;

      // Fetch all test results for user (already in reverse chronological order)
      const allResults = await services.testResultRepository.findByUserId(userId) || [];

      // Apply pagination if requested
      const paginatedResults = allResults.slice(offset, offset + limit);

      res.status(200).json({
        results: paginatedResults,
        pagination: {
          page,
          limit,
          total: allResults.length,
          totalPages: Math.ceil(allResults.length / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
