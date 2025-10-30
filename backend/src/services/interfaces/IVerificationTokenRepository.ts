import { VerificationToken } from '../../types';

/**
 * Interface for verification token repository
 * Handles storage and retrieval of email verification tokens
 */
export interface IVerificationTokenRepository {
  /**
   * Create a new verification token
   * @param email - The email address to associate with the token
   * @param token - The verification token
   * @param expiresAt - When the token expires
   * @returns The created verification token
   */
  create(email: string, token: string, expiresAt: Date): Promise<VerificationToken>;

  /**
   * Find a verification token by token string
   * @param token - The token to find
   * @returns The verification token if found, null otherwise
   */
  findByToken(token: string): Promise<VerificationToken | null>;

  /**
   * Mark a token as used
   * @param token - The token to mark as used
   * @returns void
   */
  markAsUsed(token: string): Promise<void>;

  /**
   * Delete expired tokens
   * @returns The number of tokens deleted
   */
  deleteExpiredTokens(): Promise<number>;

  /**
   * Delete all tokens for a specific email
   * @param email - The email address
   * @returns The number of tokens deleted
   */
  deleteByEmail(email: string): Promise<number>;
}
