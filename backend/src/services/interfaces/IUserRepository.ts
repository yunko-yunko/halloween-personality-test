import { User } from '../../types';

/**
 * Interface for user data access
 * Supports both PostgreSQL and no-op implementations based on feature flags
 */
export interface IUserRepository {
  /**
   * Find user by email address
   * @param email - Email address to search for
   * @returns User if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Create new user
   * @param email - Email address for new user
   * @returns Created user
   */
  create(email: string): Promise<User>;

  /**
   * Update user's last login timestamp
   * @param userId - User ID to update
   */
  updateLastLogin(userId: string): Promise<void>;
}
