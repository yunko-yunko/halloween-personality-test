import { HalloweenCharacter } from '../../types';

/**
 * Interface for email service implementations
 * Supports both AWS SES and no-op implementations based on feature flags
 */
export interface IEmailService {
  /**
   * Send verification email with token link
   * @param email - Recipient email address
   * @param token - Verification token to include in link
   */
  sendVerificationEmail(email: string, token: string): Promise<void>;

  /**
   * Send test result email with character information
   * @param email - Recipient email address
   * @param character - Halloween character result
   */
  sendResultEmail(email: string, character: HalloweenCharacter): Promise<void>;
}
