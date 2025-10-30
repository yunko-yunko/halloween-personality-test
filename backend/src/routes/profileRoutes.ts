import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
const profileController = new ProfileController();

/**
 * GET /api/profile/me
 * Returns current user information
 * Protected by requireAuth middleware
 */
router.get('/me', requireAuth, profileController.getMe.bind(profileController));

/**
 * GET /api/profile/history
 * Returns all test results for the authenticated user in reverse chronological order
 * Protected by requireAuth middleware
 * Optional query params: ?page=1&limit=10 for pagination
 */
router.get('/history', requireAuth, profileController.getHistory.bind(profileController));

export default router;
