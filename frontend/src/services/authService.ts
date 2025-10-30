/**
 * Auth Service
 * Handles API calls related to authentication and user profile
 */

import api from './api';
import type {
  SendVerificationRequest,
  SendVerificationResponse,
  VerifyTokenResponse,
  LogoutResponse,
  GetProfileResponse,
  GetHistoryResponse,
} from '../types';

/**
 * Auth service object containing all authentication-related API methods
 */
export const authService = {
  /**
   * Send verification email to the provided email address
   * @param email - User's email address
   * @returns Promise with success message
   */
  async sendVerification(email: string): Promise<SendVerificationResponse> {
    const response = await api.post<SendVerificationResponse>('/auth/send-verification', {
      email,
    } as SendVerificationRequest);
    return response.data;
  },

  /**
   * Verify email token and authenticate user
   * @param token - Verification token from email link
   * @returns Promise with user data
   */
  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    const response = await api.get<VerifyTokenResponse>(`/auth/verify-token?token=${token}`);
    return response.data;
  },

  /**
   * Logout current user
   * @returns Promise with logout confirmation
   */
  async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>('/auth/logout');
    return response.data;
  },

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  async getProfile(): Promise<GetProfileResponse> {
    const response = await api.get<GetProfileResponse>('/profile/me');
    return response.data;
  },

  /**
   * Get user's test history
   * @returns Promise with test results array
   */
  async getHistory(): Promise<GetHistoryResponse> {
    const response = await api.get<GetHistoryResponse>('/profile/history');
    return response.data;
  },
};
