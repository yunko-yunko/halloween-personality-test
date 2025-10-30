import { PoolClient } from 'pg';

/**
 * Interface for database connection implementations
 * Abstracts database operations to allow swapping between PostgreSQL, Aurora, etc.
 */
export interface IDatabaseConnection {
  /**
   * Execute a SQL query with optional parameters
   * @param sql - SQL query string
   * @param params - Optional query parameters for parameterized queries
   * @returns Array of result rows
   */
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;

  /**
   * Get a database client from the connection pool
   * Used for transactions or multiple related queries
   * @returns Database client that must be released after use
   */
  getClient(): Promise<PoolClient>;

  /**
   * Close all database connections
   * Should be called during application shutdown
   */
  end(): Promise<void>;
}
