/**
 * Auth Service Tests
 * Tests for authentication-related API methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './authService';
import api from './api';
import type {
  SendVerificationResponse,
  VerifyTokenResponse,
  LogoutResponse,
  GetProfileResponse,
  GetHistoryResponse,
  ApiError,
} from '../types';

// Mock the api module
vi.mock('./api');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendVerification', () => {
    it('should send verification email successfully', async () => {
      const mockResponse: SendVerificationResponse = {
        message: '인증 이메일이 전송되었습니다.',
        success: true,
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.sendVerification('test@example.com');

      expect(api.post).toHaveBeenCalledWith('/auth/send-verification', {
        email: 'test@example.com',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid email error', async () => {
      const mockError: ApiError = {
        code: 'INVALID_EMAIL',
        message: '유효하지 않은 이메일 주소입니다.',
        statusCode: 400,
      };

      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(authService.sendVerification('invalid-email')).rejects.toEqual(mockError);
    });

    it('should handle email send failure', async () => {
      const mockError: ApiError = {
        code: 'EMAIL_SEND_FAILED',
        message: '이메일 전송에 실패했습니다. 다시 시도해주세요.',
        statusCode: 500,
      };

      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(authService.sendVerification('test@example.com')).rejects.toEqual(mockError);
    });

    it('should handle network errors', async () => {
      const mockError: ApiError = {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        statusCode: 0,
      };

      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(authService.sendVerification('test@example.com')).rejects.toEqual(mockError);
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const mockResponse: VerifyTokenResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        message: '인증이 완료되었습니다.',
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await authService.verifyToken('valid-token-123');

      expect(api.get).toHaveBeenCalledWith('/auth/verify-token?token=valid-token-123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid token error', async () => {
      const mockError: ApiError = {
        code: 'TOKEN_INVALID',
        message: '유효하지 않은 인증 링크입니다.',
        statusCode: 400,
      };

      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(authService.verifyToken('invalid-token')).rejects.toEqual(mockError);
    });

    it('should handle expired token error', async () => {
      const mockError: ApiError = {
        code: 'TOKEN_EXPIRED',
        message: '인증 링크가 만료되었습니다. 다시 시도해주세요.',
        statusCode: 400,
      };

      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(authService.verifyToken('expired-token')).rejects.toEqual(mockError);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockResponse: LogoutResponse = {
        message: '로그아웃되었습니다.',
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse);
    });

    it('should handle logout errors gracefully', async () => {
      const mockError: ApiError = {
        code: 'LOGOUT_ERROR',
        message: '로그아웃 중 오류가 발생했습니다.',
        statusCode: 500,
      };

      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(authService.logout()).rejects.toEqual(mockError);
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockResponse: GetProfileResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await authService.getProfile();

      expect(api.get).toHaveBeenCalledWith('/profile/me');
      expect(result).toEqual(mockResponse);
    });

    it('should handle unauthorized error', async () => {
      const mockError: ApiError = {
        code: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
        statusCode: 401,
      };

      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(authService.getProfile()).rejects.toEqual(mockError);
    });

    it('should handle database errors', async () => {
      const mockError: ApiError = {
        code: 'DATABASE_ERROR',
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        statusCode: 500,
      };

      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(authService.getProfile()).rejects.toEqual(mockError);
    });
  });

  describe('getHistory', () => {
    it('should get test history successfully', async () => {
      const mockResponse: GetHistoryResponse = {
        results: [
          {
            id: '1',
            userId: '123',
            characterType: 'zombie',
            mbtiType: 'ESTJ',
            completedAt: new Date('2024-01-01'),
          },
          {
            id: '2',
            userId: '123',
            characterType: 'vampire',
            mbtiType: 'ISTJ',
            completedAt: new Date('2024-01-02'),
          },
        ],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await authService.getHistory();

      expect(api.get).toHaveBeenCalledWith('/profile/history');
      expect(result).toEqual(mockResponse);
      expect(result.results).toHaveLength(2);
    });

    it('should handle empty history', async () => {
      const mockResponse: GetHistoryResponse = {
        results: [],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await authService.getHistory();

      expect(api.get).toHaveBeenCalledWith('/profile/history');
      expect(result.results).toHaveLength(0);
    });

    it('should handle unauthorized error', async () => {
      const mockError: ApiError = {
        code: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
        statusCode: 401,
      };

      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(authService.getHistory()).rejects.toEqual(mockError);
    });

    it('should handle database errors', async () => {
      const mockError: ApiError = {
        code: 'DATABASE_ERROR',
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        statusCode: 500,
      };

      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(authService.getHistory()).rejects.toEqual(mockError);
    });
  });

  describe('error handling consistency', () => {
    it('should handle network errors consistently across all methods', async () => {
      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        statusCode: 0,
      };

      vi.mocked(api.post).mockRejectedValue(networkError);
      vi.mocked(api.get).mockRejectedValue(networkError);

      await expect(authService.sendVerification('test@example.com')).rejects.toEqual(networkError);
      await expect(authService.verifyToken('token')).rejects.toEqual(networkError);
      await expect(authService.logout()).rejects.toEqual(networkError);
      await expect(authService.getProfile()).rejects.toEqual(networkError);
      await expect(authService.getHistory()).rejects.toEqual(networkError);
    });

    it('should handle unknown errors consistently across all methods', async () => {
      const unknownError: ApiError = {
        code: 'UNKNOWN_ERROR',
        message: '알 수 없는 오류가 발생했습니다.',
        statusCode: 0,
      };

      vi.mocked(api.post).mockRejectedValue(unknownError);
      vi.mocked(api.get).mockRejectedValue(unknownError);

      await expect(authService.sendVerification('test@example.com')).rejects.toEqual(unknownError);
      await expect(authService.verifyToken('token')).rejects.toEqual(unknownError);
      await expect(authService.logout()).rejects.toEqual(unknownError);
      await expect(authService.getProfile()).rejects.toEqual(unknownError);
      await expect(authService.getHistory()).rejects.toEqual(unknownError);
    });
  });
});
