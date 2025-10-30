import { IVerificationTokenRepository } from './interfaces/IVerificationTokenRepository';
import { VerificationToken } from '../types';
import {
  generateVerificationToken,
  calculateTokenExpiration,
  isTokenExpired,
  isValidTokenFormat,
} from '../utils/tokenUtils';

/**
 * Service for managing verification tokens
 * Handles token generation, validation, and cleanup
 */
export class VerificationTokenService {
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private tokenRepository: IVerificationTokenRepository) {}

  /**
   * Generate and store a new verification token
   * @param email - Email address to associate with the token
   * @returns The generated token string and expiration date
   */
  async generateToken(email: string): Promise<{ token: string; expiresAt: Date }> {
    const token = generateVerificationToken();
    const expiresAt = calculateTokenExpiration();

    // Delete any existing tokens for this email before creating a new one
    await this.tokenRepository.deleteByEmail(email);

    // Create the new token
    await this.tokenRepository.create(email, token, expiresAt);

    return { token, expiresAt };
  }

  /**
   * Validate a verification token
   * @param token - The token to validate
   * @returns The verification token if valid
   * @throws Error if token is invalid, expired, or already used
   */
  async validateToken(token: string): Promise<VerificationToken> {
    // Check token format
    if (!isValidTokenFormat(token)) {
      throw new Error('유효하지 않은 인증 링크입니다.');
    }

    // Find the token in the database
    const verificationToken = await this.tokenRepository.findByToken(token);

    if (!verificationToken) {
      throw new Error('유효하지 않은 인증 링크입니다.');
    }

    // Check if token has already been used
    if (verificationToken.used) {
      throw new Error('이미 사용된 인증 링크입니다.');
    }

    // Check if token has expired
    if (isTokenExpired(verificationToken.expiresAt)) {
      throw new Error('인증 링크가 만료되었습니다. 다시 시도해주세요.');
    }

    return verificationToken;
  }

  /**
   * Mark a token as used after successful verification
   * @param token - The token to mark as used
   */
  async markTokenAsUsed(token: string): Promise<void> {
    await this.tokenRepository.markAsUsed(token);
  }

  /**
   * Clean up expired tokens
   * @returns The number of tokens deleted
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const deletedCount = await this.tokenRepository.deleteExpiredTokens();
      console.log(`[VerificationTokenService] Cleaned up ${deletedCount} expired tokens`);
      return deletedCount;
    } catch (error) {
      console.error('[VerificationTokenService] Error cleaning up expired tokens:', error);
      throw error;
    }
  }

  /**
   * Start automatic cleanup job for expired tokens
   * Runs every hour by default
   * @param intervalMs - Interval in milliseconds (default: 1 hour)
   */
  startCleanupJob(intervalMs: number = 60 * 60 * 1000): void {
    if (this.cleanupInterval) {
      console.log('[VerificationTokenService] Cleanup job already running');
      return;
    }

    console.log('[VerificationTokenService] Starting cleanup job');
    
    // Run cleanup immediately on start
    this.cleanupExpiredTokens().catch((error) => {
      console.error('[VerificationTokenService] Initial cleanup failed:', error);
    });

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens().catch((error) => {
        console.error('[VerificationTokenService] Scheduled cleanup failed:', error);
      });
    }, intervalMs);
  }

  /**
   * Stop the automatic cleanup job
   */
  stopCleanupJob(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[VerificationTokenService] Cleanup job stopped');
    }
  }
}
