import { IEmailService } from '../interfaces/IEmailService';
import { HalloweenCharacter } from '../../types';

/**
 * No-op email service implementation for simple mode
 * Logs email operations instead of actually sending emails
 */
export class NoOpEmailService implements IEmailService {
  /**
   * Logs verification email instead of sending
   * @param email - Recipient email address
   * @param token - Verification token
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log('[NoOpEmailService] Would send verification email:', {
      to: email,
      token,
      message: 'Verification email not sent in simple mode',
    });
  }

  /**
   * Logs result email instead of sending
   * @param email - Recipient email address
   * @param character - Halloween character result
   */
  async sendResultEmail(email: string, character: HalloweenCharacter): Promise<void> {
    console.log('[NoOpEmailService] Would send result email:', {
      to: email,
      character,
      message: 'Result email not sent in simple mode',
    });
  }
}
