import request from 'supertest';
import { ServiceFactory, ServiceContainer } from '../../services/ServiceFactory';
import { IEmailService } from '../../services/interfaces/IEmailService';
import { IUserRepository } from '../../services/interfaces/IUserRepository';
import { IVerificationTokenRepository } from '../../services/interfaces/IVerificationTokenRepository';
import { User, VerificationToken } from '../../types';
import { generateVerificationToken, calculateTokenExpiration } from '../../utils/tokenUtils';

// Mock the features module to return true for emailAuth
jest.mock('../../config/features', () => ({
  features: {
    emailAuth: true,
  },
})); 

// Import app after mocking features
import app from '../../app';

// Mock implementations for testing
class MockEmailService implements IEmailService {
  public sentEmails: Array<{ email: string; token: string }> = [];

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    this.sentEmails.push({ email, token });
  }

  async sendResultEmail(email: string, character: any): Promise<void> {
    // Not used in auth tests
  }
}

class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null;
  }

  async create(email: string): Promise<User> {
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    this.usersByEmail.set(email, user);
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.updatedAt = new Date();
    }
  }

  // Helper for tests
  clear(): void {
    this.users.clear();
    this.usersByEmail.clear();
  }
}

class MockVerificationTokenRepository implements IVerificationTokenRepository {
  private tokens: Map<string, VerificationToken> = new Map();

  async create(email: string, token: string, expiresAt: Date): Promise<VerificationToken> {
    const verificationToken: VerificationToken = {
      token,
      email,
      expiresAt,
      used: false,
      createdAt: new Date(),
    };
    this.tokens.set(token, verificationToken);
    return verificationToken;
  }

  async findByToken(token: string): Promise<VerificationToken | null> {
    return this.tokens.get(token) || null;
  }

  async markAsUsed(token: string): Promise<void> {
    const verificationToken = this.tokens.get(token);
    if (verificationToken) {
      verificationToken.used = true;
    }
  }

  async deleteExpiredTokens(): Promise<number> {
    let count = 0;
    const now = new Date();
    for (const [token, verificationToken] of this.tokens.entries()) {
      if (verificationToken.expiresAt < now) {
        this.tokens.delete(token);
        count++;
      }
    }
    return count;
  }

  async deleteByEmail(email: string): Promise<number> {
    let count = 0;
    for (const [token, verificationToken] of this.tokens.entries()) {
      if (verificationToken.email === email) {
        this.tokens.delete(token);
        count++;
      }
    }
    return count;
  }

  // Helper for tests
  clear(): void {
    this.tokens.clear();
  }
}

describe('Auth Routes', () => {
  let mockEmailService: MockEmailService;
  let mockUserRepository: MockUserRepository;
  let mockTokenRepository: MockVerificationTokenRepository;

  beforeEach(() => {
    // Reset service factory
    ServiceFactory.reset();

    // Create mock services
    mockEmailService = new MockEmailService();
    mockUserRepository = new MockUserRepository();
    mockTokenRepository = new MockVerificationTokenRepository();

    // Inject mock services
    const mockServices: ServiceContainer = {
      emailService: mockEmailService,
      userRepository: mockUserRepository,
      testResultRepository: {} as any, // Not used in auth tests
      verificationTokenRepository: mockTokenRepository,
    };

    ServiceFactory.createCustomContainer(mockServices);
  });

  afterEach(() => {
    ServiceFactory.reset();
    mockUserRepository.clear();
    mockTokenRepository.clear();
  });

  describe('POST /api/auth/send-verification', () => {
    it('should send verification email for valid email', async () => {
      const email = 'test@example.com';

      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({ email })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '인증 이메일이 전송되었습니다. 이메일을 확인해주세요.');
      expect(mockEmailService.sentEmails).toHaveLength(1);
      expect(mockEmailService.sentEmails[0].email).toBe(email);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.message).toContain('유효하지 않은 이메일 주소입니다');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should delete old tokens when sending new verification', async () => {
      const email = 'test@example.com';

      // Send first verification
      await request(app)
        .post('/api/auth/send-verification')
        .send({ email })
        .expect(200);

      const firstToken = mockEmailService.sentEmails[0].token;

      // Send second verification
      await request(app)
        .post('/api/auth/send-verification')
        .send({ email })
        .expect(200);

      // First token should be deleted
      const oldToken = await mockTokenRepository.findByToken(firstToken);
      expect(oldToken).toBeNull();

      // New token should exist
      const newToken = mockEmailService.sentEmails[1].token;
      const tokenExists = await mockTokenRepository.findByToken(newToken);
      expect(tokenExists).not.toBeNull();
    });

    it('should return 403 when feature flag is disabled', async () => {
      // Temporarily mock features to return false
      const features = require('../../config/features');
      const originalEmailAuth = features.features.emailAuth;
      features.features.emailAuth = false;

      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({ email: 'test@example.com' })
        .expect(403);

      expect(response.body).toHaveProperty('code', 'FEATURE_DISABLED');
      expect(response.body.message).toContain('이메일 인증 기능이 비활성화되어 있습니다');

      // Restore original value
      features.features.emailAuth = originalEmailAuth;
    });
  });

  describe('GET /api/auth/verify-token', () => {
    it('should verify valid token and create new user', async () => {
      const email = 'newuser@example.com';
      const token = generateVerificationToken();
      const expiresAt = calculateTokenExpiration();

      await mockTokenRepository.create(email, token, expiresAt);

      const response = await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', email);
      expect(response.body).toHaveProperty('message', '인증이 완료되었습니다.');

      // Check that cookie was set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('session_token');
      expect(cookies[0]).toContain('HttpOnly');

      // Verify token was marked as used
      const verificationToken = await mockTokenRepository.findByToken(token);
      expect(verificationToken?.used).toBe(true);
    });

    it('should verify valid token and retrieve existing user', async () => {
      const email = 'existing@example.com';
      
      // Create existing user
      const existingUser = await mockUserRepository.create(email);
      
      const token = generateVerificationToken();
      const expiresAt = calculateTokenExpiration();
      await mockTokenRepository.create(email, token, expiresAt);

      const response = await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(200);

      expect(response.body.user).toHaveProperty('id', existingUser.id);
      expect(response.body.user).toHaveProperty('email', email);
    });

    it('should return 400 for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .expect(400);

      expect(response.body).toHaveProperty('code', 'INVALID_REQUEST');
      expect(response.body.message).toContain('인증 토큰이 필요합니다');
    });

    it('should return 400 for invalid token format', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .query({ token: 'invalid-token' })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VERIFICATION_FAILED');
      expect(response.body.message).toContain('유효하지 않은 인증 링크입니다');
    });

    it('should return 400 for non-existent token', async () => {
      const token = generateVerificationToken();

      const response = await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VERIFICATION_FAILED');
      expect(response.body.message).toContain('유효하지 않은 인증 링크입니다');
    });

    it('should return 400 for already used token', async () => {
      const email = 'test@example.com';
      const token = generateVerificationToken();
      const expiresAt = calculateTokenExpiration();

      await mockTokenRepository.create(email, token, expiresAt);
      await mockTokenRepository.markAsUsed(token);

      const response = await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VERIFICATION_FAILED');
      expect(response.body.message).toContain('이미 사용된 인증 링크입니다');
    });

    it('should return 400 for expired token', async () => {
      const email = 'test@example.com';
      const token = generateVerificationToken();
      const expiresAt = new Date(Date.now() - 1000); // Expired 1 second ago

      await mockTokenRepository.create(email, token, expiresAt);

      const response = await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VERIFICATION_FAILED');
      expect(response.body.message).toContain('인증 링크가 만료되었습니다');
    });

    it('should return 403 when feature flag is disabled', async () => {
      // Temporarily mock features to return false
      const features = require('../../config/features');
      const originalEmailAuth = features.features.emailAuth;
      features.features.emailAuth = false;

      const token = generateVerificationToken();

      const response = await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(403);

      expect(response.body).toHaveProperty('code', 'FEATURE_DISABLED');

      // Restore original value
      features.features.emailAuth = originalEmailAuth;
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear session cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', '로그아웃되었습니다.');

      // Check that cookie was cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('session_token=;');
    });

    it('should work even without existing session', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', '로그아웃되었습니다.');
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full flow: send verification -> verify token -> logout', async () => {
      const email = 'fullflow@example.com';

      // Step 1: Send verification email
      const sendResponse = await request(app)
        .post('/api/auth/send-verification')
        .send({ email })
        .expect(200);

      expect(sendResponse.body.success).toBe(true);
      expect(mockEmailService.sentEmails).toHaveLength(1);

      const token = mockEmailService.sentEmails[0].token;

      // Step 2: Verify token
      const verifyResponse = await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(200);

      expect(verifyResponse.body.user.email).toBe(email);
      
      const cookies = verifyResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();
      
      // Extract session token from cookie
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      const sessionCookie = cookieArray.find((c) => c.startsWith('session_token='));
      expect(sessionCookie).toBeDefined();

      // Step 3: Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', sessionCookie!)
        .expect(200);

      expect(logoutResponse.body.message).toBe('로그아웃되었습니다.');
    });

    it('should handle returning user flow', async () => {
      const email = 'returning@example.com';

      // First time: create user
      await request(app)
        .post('/api/auth/send-verification')
        .send({ email })
        .expect(200);

      const firstToken = mockEmailService.sentEmails[0].token;

      const firstVerify = await request(app)
        .get('/api/auth/verify-token')
        .query({ token: firstToken })
        .expect(200);

      const userId = firstVerify.body.user.id;

      // Second time: returning user
      await request(app)
        .post('/api/auth/send-verification')
        .send({ email })
        .expect(200);

      const secondToken = mockEmailService.sentEmails[1].token;

      const secondVerify = await request(app)
        .get('/api/auth/verify-token')
        .query({ token: secondToken })
        .expect(200);

      // Should be the same user
      expect(secondVerify.body.user.id).toBe(userId);
      expect(secondVerify.body.user.email).toBe(email);
    });
  });

  describe('Security', () => {
    it('should set secure cookie flags in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const email = 'secure@example.com';
      const token = generateVerificationToken();
      const expiresAt = calculateTokenExpiration();

      await mockTokenRepository.create(email, token, expiresAt);

      const response = await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(200);

      const cookies = response.headers['set-cookie'];
      expect(cookies[0]).toContain('Secure');
      expect(cookies[0]).toContain('HttpOnly');
      expect(cookies[0]).toContain('SameSite=Strict');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not allow token reuse', async () => {
      const email = 'noreuse@example.com';
      const token = generateVerificationToken();
      const expiresAt = calculateTokenExpiration();

      await mockTokenRepository.create(email, token, expiresAt);

      // First verification - should succeed
      await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(200);

      // Second verification with same token - should fail
      const response = await request(app)
        .get('/api/auth/verify-token')
        .query({ token })
        .expect(400);

      expect(response.body.message).toContain('이미 사용된 인증 링크입니다');
    });
  });
});
