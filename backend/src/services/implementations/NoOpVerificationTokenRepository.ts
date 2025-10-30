import { IVerificationTokenRepository } from '../interfaces/IVerificationTokenRepository';
import { VerificationToken } from '../../types';

/**
 * No-op verification token repository for simple mode
 * Does not persist tokens - used when email authentication is disabled
 */
export class NoOpVerificationTokenRepository implements IVerificationTokenRepository {
  /**
   * Create a new verification token (no-op)
   * @returns A mock verification token
   */
  async create(email: string, token: string, expiresAt: Date): Promise<VerificationToken> {
    console.log('[NoOpVerificationTokenRepository] create called (no-op):', { email, token });
    return {
      token,
      email,
      expiresAt,
      used: false,
      createdAt: new Date(),
    };
  }

  /**
   * Find a verification token by token string (no-op)
   * @returns null (no tokens stored)
   */
  async findByToken(token: string): Promise<VerificationToken | null> {
    console.log('[NoOpVerificationTokenRepository] findByToken called (no-op):', token);
    return null;
  }

  /**
   * Mark a token as used (no-op)
   */
  async markAsUsed(token: string): Promise<void> {
    console.log('[NoOpVerificationTokenRepository] markAsUsed called (no-op):', token);
  }

  /**
   * Delete expired tokens (no-op)
   * @returns 0 (no tokens deleted)
   */
  async deleteExpiredTokens(): Promise<number> {
    console.log('[NoOpVerificationTokenRepository] deleteExpiredTokens called (no-op)');
    return 0;
  }

  /**
   * Delete all tokens for a specific email (no-op)
   * @returns 0 (no tokens deleted)
   */
  async deleteByEmail(email: string): Promise<number> {
    console.log('[NoOpVerificationTokenRepository] deleteByEmail called (no-op):', email);
    return 0;
  }
}
