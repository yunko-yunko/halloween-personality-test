import { Router } from 'express';
import { TestController } from '../controllers/testController';
import { validateRequest } from '../middleware/validateRequest';
import { optionalAuth } from '../middleware/authMiddleware';
import { submitTestSchema } from '../utils/validation';

const router = Router();
const testController = new TestController();

/**
 * GET /api/test/questions
 * Returns all test questions
 */
router.get('/questions', testController.getQuestions);

/**
 * POST /api/test/submit
 * Submits test answers and returns calculated result
 * Validates that all 15 questions are answered
 * Uses optionalAuth to save results and send email when user is authenticated
 */
router.post('/submit', optionalAuth, validateRequest(submitTestSchema), testController.submitTest);

export default router;

