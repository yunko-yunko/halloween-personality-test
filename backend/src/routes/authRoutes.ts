import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { sendVerificationSchema } from '../utils/validation';

const router = Router();
const authController = new AuthController();

/**
 * POST /api/auth/send-verification
 * Send verification email with token
 * Body: { email: string }
 */
router.post(
  '/send-verification',
  validateRequest(sendVerificationSchema),
  authController.sendVerification.bind(authController)
);

/**
 * GET /api/auth/verify-token
 * Verify token and create/retrieve user session
 * Query: ?token=<verification-token>
 */
router.get('/verify-token', authController.verifyToken.bind(authController));

/**
 * POST /api/auth/logout
 * Clear session cookie
 */
router.post('/logout', authController.logout.bind(authController));

export default router;
