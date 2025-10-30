import { VerificationTokenService } from '../VerificationTokenService';
import { IVerificationTokenRepository } from '../interfaces/IVerificationTokenRepository';
import { VerificationToken } from '../../types';

// Mock the token utils
jest.mock('../../utils/tokenUtils', () => ({
  generateVerificationToken: jest.fn(() => 'mock-token-uuid'),
  calculateTokenExpiration: jest.fn(() => new Date('2024-12-31T23:59:59Z')),
  isTokenExpired: jest.fn((date: Date) => date < new Date()),
  isValidTokenFormat: jest.fn((token: string) => token.includes('mock-token')),
  TOKEN_EXPIRATION_MS: 24 * 60 * 60 * 1000,
}));

describe('VerificationTokenService', () => {
  let service: VerificationTokenService;
  let mockRepository: jest.Mocked<IVerificationTokenRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markAsUsed: jest.fn(),
      deleteExpiredTokens: jest.fn(),
      deleteByEmail: jest.fn(),
    };

    service = new VerificationTokenService(mockRepository);
  });

  afterEach(() => {
    service.stopCleanupJob();
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate and store a new token', async () => {
      const email = 'test@example.com';
      const mockToken: VerificationToken = {
        token: 'mock-token-uuid',
        email,
        expiresAt: new Date('2024-12-31T23:59:59Z'),
        used: false,
        createdAt: new Date(),
      };

      mockRepository.deleteByEmail.mockResolvedValue(0);
      mockRepository.create.mockResolvedValue(mockToken);

      const result = await service.generateToken(email);

      expect(mockRepository.deleteByEmail).toHaveBeenCalledWith(email);
      expect(mockRepository.create).toHaveBeenCalledWith(
        email,
        'mock-token-uuid',
        new Date('2024-12-31T23:59:59Z')
      );
      expect(result).toEqual({
        token: 'mock-token-uuid',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
      });
    });

    it('should delete existing tokens before creating new one', async () => {
      const email = 'test@example.com';
      mockRepository.deleteByEmail.mockResolvedValue(2);
      mockRepository.create.mockResolvedValue({} as VerificationToken);

      await service.generateToken(email);

      expect(mockRepository.deleteByEmail).toHaveBeenCalledWith(email);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const token = 'mock-token-uuid';
      const mockToken: VerificationToken = {
        token,
        email: 'test@example.com',
        expiresAt: new Date('2099-12-31T23:59:59Z'), // Future date
        used: false,
        createdAt: new Date(),
      };

      mockRepository.findByToken.mockResolvedValue(mockToken);

      const result = await service.validateToken(token);

      expect(result).toEqual(mockToken);
      expect(mockRepository.findByToken).toHaveBeenCalledWith(token);
    });

    it('should throw error for invalid token format', async () => {
      const token = 'invalid-token';

      await expect(service.validateToken(token)).rejects.toThrow('유효하지 않은 인증 링크입니다.');
      expect(mockRepository.findByToken).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent token', async () => {
      const token = 'mock-token-uuid';
      mockRepository.findByToken.mockResolvedValue(null);

      await expect(service.validateToken(token)).rejects.toThrow('유효하지 않은 인증 링크입니다.');
    });

    it('should throw error for already used token', async () => {
      const token = 'mock-token-uuid';
      const mockToken: VerificationToken = {
        token,
        email: 'test@example.com',
        expiresAt: new Date('2099-12-31T23:59:59Z'),
        used: true, // Already used
        createdAt: new Date(),
      };

      mockRepository.findByToken.mockResolvedValue(mockToken);

      await expect(service.validateToken(token)).rejects.toThrow('이미 사용된 인증 링크입니다.');
    });

    it('should throw error for expired token', async () => {
      const token = 'mock-token-uuid';
      const mockToken: VerificationToken = {
        token,
        email: 'test@example.com',
        expiresAt: new Date('2020-01-01T00:00:00Z'), // Past date
        used: false,
        createdAt: new Date(),
      };

      mockRepository.findByToken.mockResolvedValue(mockToken);

      await expect(service.validateToken(token)).rejects.toThrow(
        '인증 링크가 만료되었습니다. 다시 시도해주세요.'
      );
    });
  });

  describe('markTokenAsUsed', () => {
    it('should mark token as used', async () => {
      const token = 'mock-token-uuid';
      mockRepository.markAsUsed.mockResolvedValue();

      await service.markTokenAsUsed(token);

      expect(mockRepository.markAsUsed).toHaveBeenCalledWith(token);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens and return count', async () => {
      mockRepository.deleteExpiredTokens.mockResolvedValue(5);

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(5);
      expect(mockRepository.deleteExpiredTokens).toHaveBeenCalled();
    });

    it('should handle cleanup errors', async () => {
      const error = new Error('Database error');
      mockRepository.deleteExpiredTokens.mockRejectedValue(error);

      await expect(service.cleanupExpiredTokens()).rejects.toThrow('Database error');
    });
  });

  describe('cleanup job', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start cleanup job and run immediately', async () => {
      mockRepository.deleteExpiredTokens.mockResolvedValue(0);

      service.startCleanupJob(1000);

      // Wait for initial cleanup
      await Promise.resolve();

      expect(mockRepository.deleteExpiredTokens).toHaveBeenCalledTimes(1);
    });

    it('should run cleanup job periodically', async () => {
      mockRepository.deleteExpiredTokens.mockResolvedValue(0);

      service.startCleanupJob(1000);

      // Wait for initial cleanup
      await Promise.resolve();

      // Fast-forward time
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(mockRepository.deleteExpiredTokens).toHaveBeenCalledTimes(3); // Initial + 2 intervals
    });

    it('should not start multiple cleanup jobs', async () => {
      mockRepository.deleteExpiredTokens.mockResolvedValue(0);

      service.startCleanupJob(1000);
      service.startCleanupJob(1000);

      await Promise.resolve();

      expect(mockRepository.deleteExpiredTokens).toHaveBeenCalledTimes(1);
    });

    it('should stop cleanup job', async () => {
      mockRepository.deleteExpiredTokens.mockResolvedValue(0);

      service.startCleanupJob(1000);
      await Promise.resolve();

      service.stopCleanupJob();

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      // Should only be called once (initial run)
      expect(mockRepository.deleteExpiredTokens).toHaveBeenCalledTimes(1);
    });
  });
});
