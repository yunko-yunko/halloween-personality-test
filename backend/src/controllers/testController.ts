import { Request, Response, NextFunction } from 'express';
import { TestScoringService } from '../services/TestScoringService';
import { SubmitTestRequest, SubmitTestResponse, GetQuestionsResponse, Question, DimensionValue } from '../types';
import questions from '../data/questions.json';
import characterDescriptions from '../data/character-descriptions.json';

/**
 * Controller for test-related endpoints
 */
export class TestController {
  private scoringService: TestScoringService;

  constructor() {
    this.scoringService = new TestScoringService();
  }

  /**
   * GET /api/test/questions
   * Returns all test questions
   */
  getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response: GetQuestionsResponse = {
        questions: questions.questions as Question[]
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/test/submit
   * Submits test answers and returns calculated result
   * In advanced mode with authentication, also saves result and sends email
   */
  submitTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { answers } = req.body as SubmitTestRequest;

      // Extract dimension values from answers
      const dimensionValues: DimensionValue[] = answers.map(answer => answer.value);

      // Calculate result using scoring service
      const { mbtiType, character } = this.scoringService.calculateResult(dimensionValues);

      // Get character info
      const rawCharacterInfo = characterDescriptions[character];

      if (!rawCharacterInfo) {
        throw new Error(`Character info not found for: ${character}`);
      }

      // Cast to proper type (JSON has array, we need tuple)
      const characterInfo: typeof rawCharacterInfo & { mbtiTypes: [string, string] } = {
        ...rawCharacterInfo,
        mbtiTypes: rawCharacterInfo.mbtiTypes as [string, string]
      };

      // In advanced mode with authenticated user, save result and send email
      if (req.user && req.services) {
        try {
          // Save test result to database
          await req.services.testResultRepository.create({
            userId: req.user.userId,
            characterType: character,
            mbtiType
          });

          // Send result email (don't fail the request if email fails)
          try {
            await req.services.emailService.sendResultEmail(req.user.email, character);
          } catch (emailError) {
            // Log email error but don't fail the request
            console.error('Failed to send result email:', emailError);
          }
        } catch (storageError) {
          // Log storage error but don't fail the request
          // User still gets their result even if storage fails
          console.error('Failed to save test result:', storageError);
        }
      }

      const response: SubmitTestResponse = {
        character,
        characterInfo,
        mbtiType
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

