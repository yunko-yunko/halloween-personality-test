import { Pool, PoolClient, PoolConfig } from 'pg';
import { IDatabaseConnection } from '../interfaces/IDatabaseConnection';
import { getDatabaseConfig } from '../../config/database';

/**
 * PostgreSQL database connection implementation
 * Implements IDatabaseConnection interface using pg Pool
 */
export class PostgresConnection implements IDatabaseConnection {
  private pool: Pool;
  private isConnected: boolean = false;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(config?: PoolConfig) {
    const dbConfig = config || getDatabaseConfig();
    this.pool = new Pool(dbConfig);

    // Set up error handler for the pool
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    // Set up connection handler
    this.pool.on('connect', () => {
      this.isConnected = true;
    });

    // Set up removal handler
    this.pool.on('remove', () => {
      if (this.pool.totalCount === 0) {
        this.isConnected = false;
      }
    });
  }

  /**
   * Execute a SQL query with optional parameters
   * Includes retry logic for transient connection errors
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.pool.query(sql, params);
        return result.rows as T[];
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable (connection errors)
        if (this.isRetryableError(error as Error) && attempt < this.maxRetries) {
          console.warn(
            `Database query failed (attempt ${attempt}/${this.maxRetries}), retrying...`,
            { error: (error as Error).message }
          );
          await this.delay(this.retryDelay * attempt);
          continue;
        }
        
        // Non-retryable error or max retries reached
        throw this.wrapError(error as Error, sql);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw this.wrapError(lastError!, sql);
  }

  /**
   * Get a database client from the connection pool
   * Client must be released after use
   */
  async getClient(): Promise<PoolClient> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const client = await this.pool.connect();
        return client;
      } catch (error) {
        lastError = error as Error;
        
        if (this.isRetryableError(error as Error) && attempt < this.maxRetries) {
          console.warn(
            `Failed to get database client (attempt ${attempt}/${this.maxRetries}), retrying...`,
            { error: (error as Error).message }
          );
          await this.delay(this.retryDelay * attempt);
          continue;
        }
        
        throw this.wrapError(error as Error, 'getClient');
      }
    }

    throw this.wrapError(lastError!, 'getClient');
  }

  /**
   * Close all database connections
   * Should be called during application shutdown
   */
  async end(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      console.log('Database connection pool closed successfully');
    } catch (error) {
      console.error('Error closing database connection pool', error);
      throw this.wrapError(error as Error, 'end');
    }
  }

  /**
   * Test the database connection
   * Useful for health checks
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed', error);
      return false;
    }
  }

  /**
   * Get pool statistics
   * Useful for monitoring
   */
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isConnected: this.isConnected,
    };
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const retryableErrorCodes = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'EAI_AGAIN',
    ];

    const errorCode = (error as any).code;
    return retryableErrorCodes.includes(errorCode);
  }

  /**
   * Wrap error with additional context
   */
  private wrapError(error: Error, context: string): Error {
    const wrappedError = new Error(
      `Database error in ${context}: ${error.message}`
    );
    wrappedError.stack = error.stack;
    (wrappedError as any).originalError = error;
    (wrappedError as any).context = context;
    return wrappedError;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
