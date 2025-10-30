import { IVerificationTokenRepository } from '../interfaces/IVerificationTokenRepository';
import { VerificationToken } from '../../types';
import { IDatabaseConnection } from '../interfaces/IDatabaseConnection';

/**
 * PostgreSQL verification token repository implementation
 * Implements token storage and retrieval using raw SQL queries with parameterized statements
 */
export class PostgresVerificationTokenRepository implements IVerificationTokenRepository {
  constructor(private connection: IDatabaseConnection) {}

  /**
   * Create a new verification token
   * @param email - The email address to associate with the token
   * @param token - The verification token
   * @param expiresAt - When the token expires
   * @returns The created verification token
   */
  async create(email: string, token: string, expiresAt: Date): Promise<VerificationToken> {
    try {
      const sql = `
        INSERT INTO verification_tokens (token, email, expires_at, used, created_at)
        VALUES ($1, $2, $3, FALSE, NOW())
        RETURNING token, email, expires_at as "expiresAt", used, created_at as "createdAt"
      `;
      
      const rows = await this.connection.query<VerificationToken>(sql, [token, email, expiresAt]);
      
      if (rows.length === 0) {
        throw new Error('Failed to create verification token: no rows returned');
      }
      
      return this.mapRowToToken(rows[0]);
    } catch (error) {
      // Check for unique constraint violation (duplicate token)
      if ((error as any).code === '23505') {
        console.error('[PostgresVerificationTokenRepository] Token already exists:', token);
        throw new Error('Token already exists');
      }
      
      console.error('[PostgresVerificationTokenRepository] Error creating token:', error);
      throw new Error(`Failed to create verification token: ${(error as Error).message}`);
    }
  }

  /**
   * Find a verification token by token string
   * @param token - The token to find
   * @returns The verification token if found, null otherwise
   */
  async findByToken(token: string): Promise<VerificationToken | null> {
    try {
      const sql = `
        SELECT token, email, expires_at as "expiresAt", used, created_at as "createdAt"
        FROM verification_tokens
        WHERE token = $1
      `;
      
      const rows = await this.connection.query<VerificationToken>(sql, [token]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToToken(rows[0]);
    } catch (error) {
      console.error('[PostgresVerificationTokenRepository] Error finding token:', error);
      throw new Error(`Failed to find verification token: ${(error as Error).message}`);
    }
  }

  /**
   * Mark a token as used
   * @param token - The token to mark as used
   * @returns void
   */
  async markAsUsed(token: string): Promise<void> {
    try {
      const sql = `
        UPDATE verification_tokens
        SET used = TRUE
        WHERE token = $1
      `;
      
      await this.connection.query(sql, [token]);
    } catch (error) {
      console.error('[PostgresVerificationTokenRepository] Error marking token as used:', error);
      throw new Error(`Failed to mark token as used: ${(error as Error).message}`);
    }
  }

  /**
   * Delete expired tokens
   * @returns The number of tokens deleted
   */
  async deleteExpiredTokens(): Promise<number> {
    try {
      const sql = `
        DELETE FROM verification_tokens
        WHERE expires_at < NOW()
      `;
      
      const result = await this.connection.query(sql);
      
      // pg returns rowCount in the result metadata
      return (result as any).rowCount || 0;
    } catch (error) {
      console.error('[PostgresVerificationTokenRepository] Error deleting expired tokens:', error);
      throw new Error(`Failed to delete expired tokens: ${(error as Error).message}`);
    }
  }

  /**
   * Delete all tokens for a specific email
   * @param email - The email address
   * @returns The number of tokens deleted
   */
  async deleteByEmail(email: string): Promise<number> {
    try {
      const sql = `
        DELETE FROM verification_tokens
        WHERE email = $1
      `;
      
      const result = await this.connection.query(sql, [email]);
      
      // pg returns rowCount in the result metadata
      return (result as any).rowCount || 0;
    } catch (error) {
      console.error('[PostgresVerificationTokenRepository] Error deleting tokens by email:', error);
      throw new Error(`Failed to delete tokens by email: ${(error as Error).message}`);
    }
  }

  /**
   * Map database row to VerificationToken object
   * Ensures proper type conversion for dates and booleans
   */
  private mapRowToToken(row: any): VerificationToken {
    return {
      token: row.token,
      email: row.email,
      expiresAt: row.expiresAt instanceof Date ? row.expiresAt : new Date(row.expiresAt),
      used: Boolean(row.used),
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
    };
  }
}
