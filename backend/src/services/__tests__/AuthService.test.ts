import { AuthService } from '../AuthService';
import { IEmailService } from '../interfaces/IEmailService';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IVerificationTokenRepository } from '../interfaces/IVerificationTokenRepository';
import { User, VerificationToken } from '../../types';
import * as jwt from '../../utils/jwt';

// Mock the jwt module
jest.mock('../../utils/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockEmailService: jest.Mocked<IEmailService>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockVerificationTokenRepository: jest.Mocked<IVerificationTokenRepository>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockVerificationToken: VerificationToken = {
    token: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID v4
    email: 'test@example.com',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    used: false,
    createdAt: new Date(),
  };

  beforeEach(() => {
    // Create mock implementations
    mockEmailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendResultEmail: jest.fn().mockResolvedValue(undefined),
    };

    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn().mockResolvedValue(undefined),
    };

    mockVerificationTokenRepository = {
      create: jest.fn().mockResolvedValue(mockVerificationToken),
      findByToken: jest.fn(),
      markAsUsed: jest.fn().mockResolvedValue(undefined),
      deleteExpiredTokens: jest.fn().mockResolvedValue(0),
      deleteByEmail: jest.fn().mockResolvedValue(0),
    };

    // Create AuthService instance with mocked dependencies
    authService = new AuthService(
      mockEmailService,
      mockUserRepository,
      mockVerificationTokenRepository
    );

    // Mock JWT functions
    (jwt.generateToken as jest.Mock).mockReturnValue('mock-jwt-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerification', () => {
    it('should generate token and send verification email for valid email', async () => {
      const email = 'test@example.com';

      await authService.sendVerification(email);

      // Should delete existing tokens for the email
      expect(mockVerificationTokenRepository.deleteByEmail).toHaveBeenCalledWith(email);
      
      // Should create a new token
      expect(mockVerificationTokenRepository.create).toHaveBeenCalledWith(
        email,
        expect.any(String),
        expect.any(Date)
      );

      // Should send verification email
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        email,
        expect.any(String)
      );
    });

    it('should throw error for invalid email format', async () => {
      const invalidEmail = 'invalid-email';

      await expect(authService.sendVerification(invalidEmail)).rejects.toThrow(
        '유효하지 않은 이메일 주소입니다.'
      );

      // Should not send email for invalid format
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should throw user-friendly error when email sending fails', async () => {
      const email = 'test@example.com';
      mockEmailService.sendVerificationEmail.mockRejectedValue(
        new Error('SES service error')
      );

      await expect(authService.sendVerification(email)).rejects.toThrow(
        '이메일 전송에 실패했습니다. 다시 시도해주세요.'
      );
    });

    it('should handle various valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.kr',
        'user_name@sub.example.com',
      ];

      for (const email of validEmails) {
        await authService.sendVerification(email);
        expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ];

      for (const email of invalidEmails) {
        await expect(authService.sendVerification(email)).rejects.toThrow(
          '유효하지 않은 이메일 주소입니다.'
        );
      }
    });
  });

  describe('verifyToken', () => {
    beforeEach(() => {
      mockVerificationTokenRepository.findByToken.mockResolvedValue(mockVerificationToken);
    });

    it('should create new user when user does not exist', async () => {
      const validToken = '550e8400-e29b-41d4-a716-446655440000';
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await authService.verifyToken(validToken);

      // Should validate token
      expect(mockVerificationTokenRepository.findByToken).toHaveBeenCalledWith(validToken);

      // Should check if user exists
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');

      // Should create new user
      expect(mockUserRepository.create).toHaveBeenCalledWith('test@example.com');

      // Should not update last login for new user
      expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();

      // Should mark token as used
      expect(mockVerificationTokenRepository.markAsUsed).toHaveBeenCalledWith(validToken);

      // Should return the user
      expect(result).toEqual(mockUser);
    });

    it('should update last login for existing user', async () => {
      const validToken = '550e8400-e29b-41d4-a716-446655440000';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.verifyToken(validToken);

      // Should check if user exists
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');

      // Should not create new user
      expect(mockUserRepository.create).not.toHaveBeenCalled();

      // Should update last login
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith('user-123');

      // Should mark token as used
      expect(mockVerificationTokenRepository.markAsUsed).toHaveBeenCalledWith(validToken);

      // Should return the user
      expect(result).toEqual(mockUser);
    });

    it('should throw error for invalid token format', async () => {
      const invalidToken = 'invalid-token-format';

      await expect(authService.verifyToken(invalidToken)).rejects.toThrow(
        '유효하지 않은 인증 링크입니다.'
      );

      // Should not proceed with user operations
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockVerificationTokenRepository.markAsUsed).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent token', async () => {
      const validToken = '550e8400-e29b-41d4-a716-446655440000';
      mockVerificationTokenRepository.findByToken.mockResolvedValue(null);

      await expect(authService.verifyToken(validToken)).rejects.toThrow(
        '유효하지 않은 인증 링크입니다.'
      );

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw error for expired token', async () => {
      const validToken = '550e8400-e29b-41d4-a716-446655440000';
      const expiredToken: VerificationToken = {
        ...mockVerificationToken,
        token: validToken,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };
      mockVerificationTokenRepository.findByToken.mockResolvedValue(expiredToken);

      await expect(authService.verifyToken(validToken)).rejects.toThrow(
        '인증 링크가 만료되었습니다. 다시 시도해주세요.'
      );

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw error for already used token', async () => {
      const validToken = '550e8400-e29b-41d4-a716-446655440000';
      const usedToken: VerificationToken = {
        ...mockVerificationToken,
        token: validToken,
        used: true,
      };
      mockVerificationTokenRepository.findByToken.mockResolvedValue(usedToken);

      await expect(authService.verifyToken(validToken)).rejects.toThrow(
        '이미 사용된 인증 링크입니다.'
      );

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw user-friendly error when database operation fails', async () => {
      const validToken = '550e8400-e29b-41d4-a716-446655440000';
      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database connection error'));

      await expect(authService.verifyToken(validToken)).rejects.toThrow(
        '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    });
  });

  describe('createSession', () => {
    it('should generate JWT token for user', () => {
      const sessionToken = authService.createSession(mockUser);

      // Should call generateToken with correct payload
      expect(jwt.generateToken).toHaveBeenCalledWith({
        userId: 'user-123',
        email: 'test@example.com',
      });

      // Should return the generated token
      expect(sessionToken).toBe('mock-jwt-token');
    });

    it('should throw user-friendly error when JWT generation fails', () => {
      (jwt.generateToken as jest.Mock).mockImplementation(() => {
        throw new Error('JWT secret not configured');
      });

      expect(() => authService.createSession(mockUser)).toThrow(
        '세션 생성에 실패했습니다. 다시 시도해주세요.'
      );
    });

    it('should create session for different users', () => {
      const users = [
        { id: 'user-1', email: 'user1@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 'user-2', email: 'user2@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 'user-3', email: 'user3@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      users.forEach((user) => {
        authService.createSession(user);
        expect(jwt.generateToken).toHaveBeenCalledWith({
          userId: user.id,
          email: user.email,
        });
      });

      expect(jwt.generateToken).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete new user registration flow', async () => {
      const email = 'newuser@example.com';
      const validToken = '550e8400-e29b-41d4-a716-446655440000';
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockVerificationTokenRepository.findByToken.mockResolvedValue({
        ...mockVerificationToken,
        token: validToken,
      });

      // Step 1: Send verification
      await authService.sendVerification(email);
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();

      // Step 2: Verify token
      const user = await authService.verifyToken(validToken);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(user).toEqual(mockUser);

      // Step 3: Create session
      const sessionToken = authService.createSession(user);
      expect(sessionToken).toBe('mock-jwt-token');
    });

    it('should handle complete returning user login flow', async () => {
      const email = 'existinguser@example.com';
      const validToken = '550e8400-e29b-41d4-a716-446655440000';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationTokenRepository.findByToken.mockResolvedValue({
        ...mockVerificationToken,
        token: validToken,
      });

      // Step 1: Send verification
      await authService.sendVerification(email);
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();

      // Step 2: Verify token
      const user = await authService.verifyToken(validToken);
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalled();
      expect(user).toEqual(mockUser);

      // Step 3: Create session
      const sessionToken = authService.createSession(user);
      expect(sessionToken).toBe('mock-jwt-token');
    });
  });
});
