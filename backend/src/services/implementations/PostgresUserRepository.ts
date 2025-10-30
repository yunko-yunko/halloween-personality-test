import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../../types';
import { IDatabaseConnection } from '../interfaces/IDatabaseConnection';

/**
 * PostgreSQL user repository implementation
 * Implements user data access using raw SQL queries with parameterized statements
 */
export class PostgresUserRepository implements IUserRepository {
  constructor(private connection: IDatabaseConnection) {}

  /**
   * Find user by email address
   * @param email - Email address to search for
   * @returns User if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const sql = `
        SELECT id, email, created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        WHERE email = $1
      `;
      
      const rows = await this.connection.query<User>(sql, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToUser(rows[0]);
    } catch (error) {
      console.error('[PostgresUserRepository] Error finding user by email:', error);
      throw new Error(`Failed to find user by email: ${(error as Error).message}`);
    }
  }

  /**
   * Create new user
   * @param email - Email address for new user
   * @returns Created user with generated ID and timestamps
   */
  async create(email: string): Promise<User> {
    try {
      const sql = `
        INSERT INTO users (email, created_at, updated_at)
        VALUES ($1, NOW(), NOW())
        RETURNING id, email, created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      const rows = await this.connection.query<User>(sql, [email]);
      
      if (rows.length === 0) {
        throw new Error('Failed to create user: no rows returned');
      }
      
      return this.mapRowToUser(rows[0]);
    } catch (error) {
      // Check for unique constraint violation
      if ((error as any).code === '23505') {
        console.error('[PostgresUserRepository] User with email already exists:', email);
        throw new Error(`User with email ${email} already exists`);
      }
      
      console.error('[PostgresUserRepository] Error creating user:', error);
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  /**
   * Update user's last login timestamp
   * @param userId - User ID to update
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const sql = `
        UPDATE users
        SET updated_at = NOW()
        WHERE id = $1
      `;
      
      await this.connection.query(sql, [userId]);
    } catch (error) {
      console.error('[PostgresUserRepository] Error updating last login:', error);
      throw new Error(`Failed to update last login: ${(error as Error).message}`);
    }
  }

  /**
   * Map database row to User object
   * Ensures proper type conversion for dates
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt),
    };
  }
}
