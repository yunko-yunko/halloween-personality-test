import { IEmailService } from './interfaces/IEmailService';
import { IUserRepository } from './interfaces/IUserRepository';
import { IVerificationTokenRepository } from './interfaces/IVerificationTokenRepository';
import { VerificationTokenService } from './VerificationTokenService';
import { generateToken } from '../utils/jwt';
import { User } from '../types';

/**
 * AuthService
 * Handles authentication business logic including email verification,
 * user creation/retrieval, and session management
 */
export class AuthService {
  private tokenService: VerificationTokenService;

  constructor(
    private emailService: IEmailService,
    private userRepository: IUserRepository,
    private verificationTokenRepository: IVerificationTokenRepository
  ) {
    this.tokenService = new VerificationTokenService(verificationTokenRepository);
  }

  /**
   * Send verification email to user
   * Generates a verification token and sends it via email
   * 
   * @param email - Email address to send verification to
   * @throws Error if email sending fails
   * 
   * @example
   * await authService.sendVerification('user@example.com');
   */
  async sendVerification(email: string): Promise<void> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new Error('유효하지 않은 이메일 주소입니다.');
      }

      // Generate verification token
      const { token } = await this.tokenService.generateToken(email);

      // Send verification email
      await this.emailService.sendVerificationEmail(email, token);
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw validation errors as-is
        if (error.message.includes('유효하지 않은')) {
          throw error;
        }
        // Wrap other errors with user-friendly message
        throw new Error('이메일 전송에 실패했습니다. 다시 시도해주세요.');
      }
      throw new Error('이메일 전송에 실패했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * Verify token and create or retrieve user
   * Validates the verification token and returns the associated user
   * Creates a new user if they don't exist, or updates last login if they do
   * 
   * @param token - Verification token to validate
   * @returns User object
   * @throws Error if token is invalid, expired, or already used
   * 
   * @example
   * const user = await authService.verifyToken('abc-123-def-456');
   */
  async verifyToken(token: string): Promise<User> {
    try {
      // Validate the token
      const verificationToken = await this.tokenService.validateToken(token);

      // Check if user exists
      let user = await this.userRepository.findByEmail(verificationToken.email);

      if (!user) {
        // New user - create account
        user = await this.userRepository.create(verificationToken.email);
      } else {
        // Returning user - update last login
        await this.userRepository.updateLastLogin(user.id);
      }

      // Mark token as used
      await this.tokenService.markTokenAsUsed(token);

      return user;
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw token validation errors as-is (they're already in Korean)
        if (
          error.message.includes('유효하지 않은') ||
          error.message.includes('만료되었습니다') ||
          error.message.includes('이미 사용된')
        ) {
          throw error;
        }
        // Wrap database errors with user-friendly message
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  /**
   * Create JWT session token for authenticated user
   * Generates a JWT token that can be used for subsequent authenticated requests
   * 
   * @param user - User to create session for
   * @returns JWT token string
   * 
   * @example
   * const sessionToken = authService.createSession(user);
   * // Set this token in an HTTP-only cookie
   */
  createSession(user: User): string {
    try {
      return generateToken({
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      throw new Error('세션 생성에 실패했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * Validate email format
   * @param email - Email address to validate
   * @returns true if email format is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
