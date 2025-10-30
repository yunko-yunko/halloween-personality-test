import request from 'supertest';
import { IEmailService } from '../../services/interfaces/IEmailService';
import { ITestResultRepository } from '../../services/interfaces/ITestResultRepository';
import { HalloweenCharacter, TestResult, TestResultInput } from '../../types';

// Mock implementations for testing
class MockEmailService implements IEmailService {
  public sentEmails: Array<{ email: string; type: 'verification' | 'result'; data?: any }> = [];

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    this.sentEmails.push({ email, type: 'verification', data: { token } });
  }

  async sendResultEmail(email: string, character: HalloweenCharacter): Promise<void> {
    this.sentEmails.push({ email, type: 'result', data: { character } });
  }

  reset() {
    this.sentEmails = [];
  }
}

class MockTestResultRepository implements ITestResultRepository {
  public results: TestResult[] = [];
  private idCounter = 1;

  async create(result: TestResultInput): Promise<TestResult> {
    const newResult: TestResult = {
      id: `test-result-${this.idCounter++}`,
      userId: result.userId,
      characterType: result.characterType,
      mbtiType: result.mbtiType,
      completedAt: new Date(),
    };
    this.results.push(newResult);
    return newResult;
  }

  async findByUserId(userId: string): Promise<TestResult[]> {
    return this.results
      .filter(r => r.userId === userId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  reset() {
    this.results = [];
    this.idCounter = 1;
  }
}

// Import after setting env
let app: any;
let ServiceFactory: any;
let generateToken: any;

describe('Test Routes', () => {
  beforeAll(async () => {
    // Ensure we're in simple mode for these tests
    process.env.ENABLE_EMAIL_AUTH = 'false';
    
    // Import modules after setting environment
    const appModule = await import('../../app');
    app = appModule.default;
    const serviceFactoryModule = await import('../../services/ServiceFactory');
    ServiceFactory = serviceFactoryModule.ServiceFactory;
    const jwtModule = await import('../../utils/jwt');
    generateToken = jwtModule.generateToken;
  });

  beforeEach(() => {
    // Reset service factory before each test
    ServiceFactory.reset();
  });

  afterEach(() => {
    ServiceFactory.reset();
  });

  describe('GET /api/test/questions', () => {
    it('should return all 15 questions', async () => {
      const response = await request(app)
        .get('/api/test/questions')
        .expect(200);

      expect(response.body).toHaveProperty('questions');
      expect(Array.isArray(response.body.questions)).toBe(true);
      expect(response.body.questions).toHaveLength(15);
    });

    it('should return questions with correct structure', async () => {
      const response = await request(app)
        .get('/api/test/questions')
        .expect(200);

      const firstQuestion = response.body.questions[0];
      expect(firstQuestion).toHaveProperty('id');
      expect(firstQuestion).toHaveProperty('text');
      expect(firstQuestion).toHaveProperty('dimension');
      expect(firstQuestion).toHaveProperty('answers');
      expect(Array.isArray(firstQuestion.answers)).toBe(true);
      expect(firstQuestion.answers).toHaveLength(2);
    });

    it('should return questions with 5 per dimension', async () => {
      const response = await request(app)
        .get('/api/test/questions')
        .expect(200);

      const questions = response.body.questions;
      const eiQuestions = questions.filter((q: any) => q.dimension === 'EI');
      const nsQuestions = questions.filter((q: any) => q.dimension === 'NS');
      const tfQuestions = questions.filter((q: any) => q.dimension === 'TF');

      expect(eiQuestions).toHaveLength(5);
      expect(nsQuestions).toHaveLength(5);
      expect(tfQuestions).toHaveLength(5);
    });
  });

  describe('POST /api/test/submit', () => {
    const validAnswers = [
      // 5 E/I answers (3 E, 2 I = E)
      { questionId: 'ei_1', answerId: 'ei_1_a', value: 'E' },
      { questionId: 'ei_2', answerId: 'ei_2_a', value: 'E' },
      { questionId: 'ei_3', answerId: 'ei_3_a', value: 'E' },
      { questionId: 'ei_4', answerId: 'ei_4_b', value: 'I' },
      { questionId: 'ei_5', answerId: 'ei_5_b', value: 'I' },
      // 5 N/S answers (3 S, 2 N = S)
      { questionId: 'ns_1', answerId: 'ns_1_b', value: 'S' },
      { questionId: 'ns_2', answerId: 'ns_2_b', value: 'S' },
      { questionId: 'ns_3', answerId: 'ns_3_b', value: 'S' },
      { questionId: 'ns_4', answerId: 'ns_4_a', value: 'N' },
      { questionId: 'ns_5', answerId: 'ns_5_a', value: 'N' },
      // 5 T/F answers (3 T, 2 F = T)
      { questionId: 'tf_1', answerId: 'tf_1_a', value: 'T' },
      { questionId: 'tf_2', answerId: 'tf_2_a', value: 'T' },
      { questionId: 'tf_3', answerId: 'tf_3_a', value: 'T' },
      { questionId: 'tf_4', answerId: 'tf_4_b', value: 'F' },
      { questionId: 'tf_5', answerId: 'tf_5_b', value: 'F' },
    ];

    it('should calculate and return result for valid answers', async () => {
      const response = await request(app)
        .post('/api/test/submit')
        .send({ answers: validAnswers })
        .expect(200);

      expect(response.body).toHaveProperty('character');
      expect(response.body).toHaveProperty('characterInfo');
      expect(response.body).toHaveProperty('mbtiType');
      expect(response.body.mbtiType).toBe('EST'); // E, S, T
    });

    it('should return correct character for EST (zombie)', async () => {
      const response = await request(app)
        .post('/api/test/submit')
        .send({ answers: validAnswers })
        .expect(200);

      expect(response.body.character).toBe('zombie');
      expect(response.body.characterInfo).toHaveProperty('name', '좀비');
      expect(response.body.characterInfo).toHaveProperty('description');
      expect(response.body.characterInfo).toHaveProperty('imagePath');
      expect(response.body.characterInfo).toHaveProperty('mbtiTypes');
    });

    it('should return 400 if answers array is missing', async () => {
      const response = await request(app)
        .post('/api/test/submit')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if not all 15 questions are answered', async () => {
      const incompleteAnswers = validAnswers.slice(0, 10); // Only 10 answers

      const response = await request(app)
        .post('/api/test/submit')
        .send({ answers: incompleteAnswers })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.message).toContain('모든 질문에 답변해주세요');
    });

    it('should return 400 if answer has invalid value', async () => {
      const invalidAnswers = [...validAnswers];
      invalidAnswers[0] = { questionId: 'ei_1', answerId: 'ei_1_a', value: 'X' as any };

      const response = await request(app)
        .post('/api/test/submit')
        .send({ answers: invalidAnswers })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 400 if answer is missing required fields', async () => {
      const invalidAnswers = [...validAnswers];
      invalidAnswers[0] = { questionId: 'ei_1', value: 'E' } as any; // Missing answerId

      const response = await request(app)
        .post('/api/test/submit')
        .send({ answers: invalidAnswers })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should test all 8 character mappings', async () => {
      const characterTests = [
        { mbti: 'EST', character: 'zombie', answers: ['E', 'E', 'E', 'I', 'I', 'S', 'S', 'S', 'N', 'N', 'T', 'T', 'T', 'F', 'F'] },
        { mbti: 'ENT', character: 'joker', answers: ['E', 'E', 'E', 'I', 'I', 'N', 'N', 'N', 'S', 'S', 'T', 'T', 'T', 'F', 'F'] },
        { mbti: 'INF', character: 'skeleton', answers: ['I', 'I', 'I', 'E', 'E', 'N', 'N', 'N', 'S', 'S', 'F', 'F', 'F', 'T', 'T'] },
        { mbti: 'ISF', character: 'nun', answers: ['I', 'I', 'I', 'E', 'E', 'S', 'S', 'S', 'N', 'N', 'F', 'F', 'F', 'T', 'T'] },
        { mbti: 'ENF', character: 'jack-o-lantern', answers: ['E', 'E', 'E', 'I', 'I', 'N', 'N', 'N', 'S', 'S', 'F', 'F', 'F', 'T', 'T'] },
        { mbti: 'IST', character: 'vampire', answers: ['I', 'I', 'I', 'E', 'E', 'S', 'S', 'S', 'N', 'N', 'T', 'T', 'T', 'F', 'F'] },
        { mbti: 'ESF', character: 'ghost', answers: ['E', 'E', 'E', 'I', 'I', 'S', 'S', 'S', 'N', 'N', 'F', 'F', 'F', 'T', 'T'] },
        { mbti: 'INT', character: 'frankenstein', answers: ['I', 'I', 'I', 'E', 'E', 'N', 'N', 'N', 'S', 'S', 'T', 'T', 'T', 'F', 'F'] },
      ];

      for (const test of characterTests) {
        const testAnswers = test.answers.map((value, index) => ({
          questionId: `q_${index}`,
          answerId: `a_${index}`,
          value: value as any
        }));

        const response = await request(app)
          .post('/api/test/submit')
          .send({ answers: testAnswers })
          .expect(200);

        expect(response.body.mbtiType).toBe(test.mbti);
        expect(response.body.character).toBe(test.character);
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/test/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/test/submit')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });
});

describe('Test Routes - Advanced Mode', () => {
  let mockEmailService: MockEmailService;
  let mockTestResultRepository: MockTestResultRepository;
  let advancedApp: any;
  let advancedServiceFactory: any;
  let advancedGenerateToken: any;

  beforeAll(async () => {
    // Set environment for advanced mode
    process.env.ENABLE_EMAIL_AUTH = 'true';
    
    // Clear module cache to reload with new environment
    jest.resetModules();
    
    // Import modules with advanced mode enabled
    const appModule = await import('../../app');
    advancedApp = appModule.default;
    const serviceFactoryModule = await import('../../services/ServiceFactory');
    advancedServiceFactory = serviceFactoryModule.ServiceFactory;
    const jwtModule = await import('../../utils/jwt');
    advancedGenerateToken = jwtModule.generateToken;
  });

  afterAll(() => {
    // Reset environment
    process.env.ENABLE_EMAIL_AUTH = 'false';
    jest.resetModules();
  });

  beforeEach(() => {
    // Reset service factory
    advancedServiceFactory.reset();
    
    // Create mock services
    mockEmailService = new MockEmailService();
    mockTestResultRepository = new MockTestResultRepository();
    
    // Inject mock services - this sets the singleton instance
    advancedServiceFactory.createCustomContainer({
      emailService: mockEmailService,
      userRepository: {} as any, // Not needed for these tests
      testResultRepository: mockTestResultRepository,
      verificationTokenRepository: {} as any, // Not needed for these tests
    });
  });

  afterEach(() => {
    advancedServiceFactory.reset();
  });

  const validAnswers = [
    // 5 E/I answers (3 E, 2 I = E)
    { questionId: 'ei_1', answerId: 'ei_1_a', value: 'E' },
    { questionId: 'ei_2', answerId: 'ei_2_a', value: 'E' },
    { questionId: 'ei_3', answerId: 'ei_3_a', value: 'E' },
    { questionId: 'ei_4', answerId: 'ei_4_b', value: 'I' },
    { questionId: 'ei_5', answerId: 'ei_5_b', value: 'I' },
    // 5 N/S answers (3 S, 2 N = S)
    { questionId: 'ns_1', answerId: 'ns_1_b', value: 'S' },
    { questionId: 'ns_2', answerId: 'ns_2_b', value: 'S' },
    { questionId: 'ns_3', answerId: 'ns_3_b', value: 'S' },
    { questionId: 'ns_4', answerId: 'ns_4_a', value: 'N' },
    { questionId: 'ns_5', answerId: 'ns_5_a', value: 'N' },
    // 5 T/F answers (3 T, 2 F = T)
    { questionId: 'tf_1', answerId: 'tf_1_a', value: 'T' },
    { questionId: 'tf_2', answerId: 'tf_2_a', value: 'T' },
    { questionId: 'tf_3', answerId: 'tf_3_a', value: 'T' },
    { questionId: 'tf_4', answerId: 'tf_4_b', value: 'F' },
    { questionId: 'tf_5', answerId: 'tf_5_b', value: 'F' },
  ];

  describe('POST /api/test/submit - Authenticated User', () => {
    it('should save test result to database when user is authenticated', async () => {
      const userId = 'test-user-123';
      const userEmail = 'test@example.com';
      const token = advancedGenerateToken({ userId, email: userEmail });

      const response = await request(advancedApp)
        .post('/api/test/submit')
        .set('Cookie', [`session_token=${token}`])
        .send({ answers: validAnswers })
        .expect(200);

      // Verify response
      expect(response.body).toHaveProperty('character', 'zombie');
      expect(response.body).toHaveProperty('mbtiType', 'EST');

      // Verify result was saved to database
      expect(mockTestResultRepository.results).toHaveLength(1);
      expect(mockTestResultRepository.results[0]).toMatchObject({
        userId,
        characterType: 'zombie',
        mbtiType: 'EST',
      });
    });

    it('should send result email when user is authenticated', async () => {
      const userId = 'test-user-456';
      const userEmail = 'user@example.com';
      const token = advancedGenerateToken({ userId, email: userEmail });

      await request(advancedApp)
        .post('/api/test/submit')
        .set('Cookie', [`session_token=${token}`])
        .send({ answers: validAnswers })
        .expect(200);

      // Verify email was sent
      expect(mockEmailService.sentEmails).toHaveLength(1);
      expect(mockEmailService.sentEmails[0]).toMatchObject({
        email: userEmail,
        type: 'result',
        data: { character: 'zombie' },
      });
    });

    it('should return result even if email sending fails', async () => {
      const userId = 'test-user-789';
      const userEmail = 'fail@example.com';
      const token = advancedGenerateToken({ userId, email: userEmail });

      // Make email service throw error
      mockEmailService.sendResultEmail = jest.fn().mockRejectedValue(new Error('Email service error'));

      const response = await request(advancedApp)
        .post('/api/test/submit')
        .set('Cookie', [`session_token=${token}`])
        .send({ answers: validAnswers })
        .expect(200);

      // Should still return result
      expect(response.body).toHaveProperty('character', 'zombie');
      expect(response.body).toHaveProperty('mbtiType', 'EST');

      // Result should still be saved
      expect(mockTestResultRepository.results).toHaveLength(1);
    });

    it('should return result even if database save fails', async () => {
      const userId = 'test-user-999';
      const userEmail = 'dbfail@example.com';
      const token = advancedGenerateToken({ userId, email: userEmail });

      // Make repository throw error
      mockTestResultRepository.create = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(advancedApp)
        .post('/api/test/submit')
        .set('Cookie', [`session_token=${token}`])
        .send({ answers: validAnswers })
        .expect(200);

      // Should still return result
      expect(response.body).toHaveProperty('character', 'zombie');
      expect(response.body).toHaveProperty('mbtiType', 'EST');
    });

    it('should handle multiple test submissions from same user', async () => {
      const userId = 'test-user-multi';
      const userEmail = 'multi@example.com';
      const token = advancedGenerateToken({ userId, email: userEmail });

      // First submission (EST - zombie)
      await request(advancedApp)
        .post('/api/test/submit')
        .set('Cookie', [`session_token=${token}`])
        .send({ answers: validAnswers })
        .expect(200);

      // Second submission (INF - skeleton)
      const differentAnswers = [
        { questionId: 'ei_1', answerId: 'ei_1_b', value: 'I' },
        { questionId: 'ei_2', answerId: 'ei_2_b', value: 'I' },
        { questionId: 'ei_3', answerId: 'ei_3_b', value: 'I' },
        { questionId: 'ei_4', answerId: 'ei_4_a', value: 'E' },
        { questionId: 'ei_5', answerId: 'ei_5_a', value: 'E' },
        { questionId: 'ns_1', answerId: 'ns_1_a', value: 'N' },
        { questionId: 'ns_2', answerId: 'ns_2_a', value: 'N' },
        { questionId: 'ns_3', answerId: 'ns_3_a', value: 'N' },
        { questionId: 'ns_4', answerId: 'ns_4_b', value: 'S' },
        { questionId: 'ns_5', answerId: 'ns_5_b', value: 'S' },
        { questionId: 'tf_1', answerId: 'tf_1_b', value: 'F' },
        { questionId: 'tf_2', answerId: 'tf_2_b', value: 'F' },
        { questionId: 'tf_3', answerId: 'tf_3_b', value: 'F' },
        { questionId: 'tf_4', answerId: 'tf_4_a', value: 'T' },
        { questionId: 'tf_5', answerId: 'tf_5_a', value: 'T' },
      ];

      await request(advancedApp)
        .post('/api/test/submit')
        .set('Cookie', [`session_token=${token}`])
        .send({ answers: differentAnswers })
        .expect(200);

      // Verify both results were saved
      expect(mockTestResultRepository.results).toHaveLength(2);
      expect(mockTestResultRepository.results[0].characterType).toBe('zombie');
      expect(mockTestResultRepository.results[1].characterType).toBe('skeleton');

      // Verify both emails were sent
      expect(mockEmailService.sentEmails).toHaveLength(2);
    });
  });

  describe('POST /api/test/submit - Unauthenticated User in Advanced Mode', () => {
    it('should return result without saving when user is not authenticated', async () => {
      const response = await request(advancedApp)
        .post('/api/test/submit')
        .send({ answers: validAnswers })
        .expect(200);

      // Should return result
      expect(response.body).toHaveProperty('character', 'zombie');
      expect(response.body).toHaveProperty('mbtiType', 'EST');

      // Should NOT save to database
      expect(mockTestResultRepository.results).toHaveLength(0);

      // Should NOT send email
      expect(mockEmailService.sentEmails).toHaveLength(0);
    });

    it('should work identically to simple mode for unauthenticated users', async () => {
      const response = await request(advancedApp)
        .post('/api/test/submit')
        .send({ answers: validAnswers })
        .expect(200);

      expect(response.body).toHaveProperty('character');
      expect(response.body).toHaveProperty('characterInfo');
      expect(response.body).toHaveProperty('mbtiType');
      expect(response.body.character).toBe('zombie');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain same response format in both modes', async () => {
      // Test unauthenticated response
      const unauthResponse = await request(advancedApp)
        .post('/api/test/submit')
        .send({ answers: validAnswers })
        .expect(200);

      // Test authenticated response
      const token = advancedGenerateToken({ userId: 'test-user', email: 'test@example.com' });
      const authResponse = await request(advancedApp)
        .post('/api/test/submit')
        .set('Cookie', [`session_token=${token}`])
        .send({ answers: validAnswers })
        .expect(200);

      // Both should have same structure
      expect(unauthResponse.body).toHaveProperty('character');
      expect(unauthResponse.body).toHaveProperty('characterInfo');
      expect(unauthResponse.body).toHaveProperty('mbtiType');
      
      expect(authResponse.body).toHaveProperty('character');
      expect(authResponse.body).toHaveProperty('characterInfo');
      expect(authResponse.body).toHaveProperty('mbtiType');

      // Both should have same values
      expect(unauthResponse.body.character).toBe(authResponse.body.character);
      expect(unauthResponse.body.mbtiType).toBe(authResponse.body.mbtiType);
    });

    it('should handle invalid token gracefully', async () => {
      const response = await request(advancedApp)
        .post('/api/test/submit')
        .set('Cookie', ['session_token=invalid-token'])
        .send({ answers: validAnswers })
        .expect(200);

      // Should still return result (optionalAuth doesn't fail on invalid token)
      expect(response.body).toHaveProperty('character', 'zombie');

      // Should NOT save to database
      expect(mockTestResultRepository.results).toHaveLength(0);
    });

    it('should handle expired token gracefully', async () => {
      // Create a token that's already expired by using jwt.sign directly
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 'test-user', email: 'test@example.com' },
        process.env.JWT_SECRET || 'default-secret-key-for-development-only',
        { expiresIn: '-1h' } // Negative expiry creates an expired token
      );

      const response = await request(advancedApp)
        .post('/api/test/submit')
        .set('Cookie', [`session_token=${expiredToken}`])
        .send({ answers: validAnswers })
        .expect(200);

      // Should still return result
      expect(response.body).toHaveProperty('character', 'zombie');

      // Should NOT save to database
      expect(mockTestResultRepository.results).toHaveLength(0);
    });
  });
});

