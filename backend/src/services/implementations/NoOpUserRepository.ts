import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../../types';

/**
 * No-op user repository implementation for simple mode
 * Returns mock data without persisting to database
 */
export class NoOpUserRepository implements IUserRepository {
  /**
   * Returns null as no users are stored in simple mode
   * @param email - Email address to search for
   * @returns Always returns null
   */
  async findByEmail(email: string): Promise<User | null> {
    console.log('[NoOpUserRepository] findByEmail called:', email);
    console.log('[NoOpUserRepository] Returning null - no persistence in simple mode');
    return null;
  }

  /**
   * Returns mock user without persisting to database
   * @param email - Email address for new user
   * @returns Mock user object
   */
  async create(email: string): Promise<User> {
    console.log('[NoOpUserRepository] create called:', email);
    console.log('[NoOpUserRepository] Returning mock user - no persistence in simple mode');
    
    const mockUser: User = {
      id: 'mock-user-id',
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return mockUser;
  }

  /**
   * Logs update operation without persisting
   * @param userId - User ID to update
   */
  async updateLastLogin(userId: string): Promise<void> {
    console.log('[NoOpUserRepository] updateLastLogin called:', userId);
    console.log('[NoOpUserRepository] No action taken - no persistence in simple mode');
  }
}
