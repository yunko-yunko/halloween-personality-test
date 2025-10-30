import { PostgresConnection } from '../implementations/PostgresConnection';
import { PoolConfig } from 'pg';

/**
 * Integration tests for PostgresConnection
 * 
 * These tests require a running PostgreSQL database.
 * By default, these tests are SKIPPED to avoid connection errors.
 * 
 * To run these tests, set SKIP_INTEGRATION_TESTS=false and configure:
 * - TEST_DB_HOST (default: localhost)
 * - TEST_DB_PORT (default: 5432)
 * - TEST_DB_NAME (default: halloween_test)
 * - TEST_DB_USER (default: postgres)
 * - TEST_DB_PASSWORD
 * 
 * Example:
 * SKIP_INTEGRATION_TESTS=false npm test -- PostgresConnection.integration.test.ts
 */

describe('PostgresConnection Integration Tests', () => {
  let connection: PostgresConnection;
  const testTableName = 'test_connection_table';

  // Check if we should skip these tests
  // By default, skip if no database connection is available
  const shouldSkipTests = process.env.SKIP_INTEGRATION_TESTS !== 'false';

  beforeAll(async () => {
    if (shouldSkipTests) {
      return;
    }

    // Use test database configuration
    const testConfig: PoolConfig = {
      host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT || '5432', 10),
      database: process.env.TEST_DB_NAME || 'halloween_test',
      user: process.env.TEST_DB_USER || process.env.DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || '',
      max: 5, // Smaller pool for tests
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 2000,
    };

    connection = new PostgresConnection(testConfig);

    // Create test table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS ${testTableName} (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          value INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('Failed to create test table:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (shouldSkipTests || !connection) {
      return;
    }

    // Clean up test table
    try {
      await connection.query(`DROP TABLE IF EXISTS ${testTableName}`);
    } catch (error) {
      console.error('Failed to drop test table:', error);
    }

    // Close connection pool
    await connection.end();
  });

  beforeEach(async () => {
    if (shouldSkipTests) {
      return;
    }

    // Clear test table before each test
    await connection.query(`DELETE FROM ${testTableName}`);
  });

  describe('query method', () => {
    it('should execute a simple SELECT query', async () => {
      if (shouldSkipTests) {
        return;
      }

      const result = await connection.query('SELECT 1 as number');
      expect(result).toHaveLength(1);
      expect(result[0].number).toBe(1);
    });

    it('should execute INSERT query with parameters', async () => {
      if (shouldSkipTests) {
        return;
      }

      const result = await connection.query(
        `INSERT INTO ${testTableName} (name, value) VALUES ($1, $2) RETURNING *`,
        ['test-item', 42]
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test-item');
      expect(result[0].value).toBe(42);
    });

    it('should execute SELECT query with parameters', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Insert test data
      await connection.query(
        `INSERT INTO ${testTableName} (name, value) VALUES ($1, $2)`,
        ['item1', 10]
      );
      await connection.query(
        `INSERT INTO ${testTableName} (name, value) VALUES ($1, $2)`,
        ['item2', 20]
      );

      // Query with parameter
      const result = await connection.query(
        `SELECT * FROM ${testTableName} WHERE value > $1 ORDER BY value`,
        [15]
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('item2');
      expect(result[0].value).toBe(20);
    });

    it('should return empty array for query with no results', async () => {
      if (shouldSkipTests) {
        return;
      }

      const result = await connection.query(
        `SELECT * FROM ${testTableName} WHERE name = $1`,
        ['nonexistent']
      );

      expect(result).toEqual([]);
    });

    it('should handle multiple queries in sequence', async () => {
      if (shouldSkipTests) {
        return;
      }

      await connection.query(
        `INSERT INTO ${testTableName} (name, value) VALUES ($1, $2)`,
        ['item1', 1]
      );
      await connection.query(
        `INSERT INTO ${testTableName} (name, value) VALUES ($1, $2)`,
        ['item2', 2]
      );
      await connection.query(
        `INSERT INTO ${testTableName} (name, value) VALUES ($1, $2)`,
        ['item3', 3]
      );

      const result = await connection.query(`SELECT COUNT(*) as count FROM ${testTableName}`);
      expect(result[0].count).toBe('3');
    });

    it('should throw error for invalid SQL', async () => {
      if (shouldSkipTests) {
        return;
      }

      await expect(
        connection.query('INVALID SQL STATEMENT')
      ).rejects.toThrow();
    });

    it('should handle SQL injection prevention with parameterized queries', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Insert test data
      await connection.query(
        `INSERT INTO ${testTableName} (name, value) VALUES ($1, $2)`,
        ['safe-item', 100]
      );

      // Attempt SQL injection (should be safely escaped)
      const maliciousInput = "'; DROP TABLE " + testTableName + "; --";
      const result = await connection.query(
        `SELECT * FROM ${testTableName} WHERE name = $1`,
        [maliciousInput]
      );

      // Should return no results (injection prevented)
      expect(result).toEqual([]);

      // Verify table still exists
      const tableCheck = await connection.query(`SELECT COUNT(*) as count FROM ${testTableName}`);
      expect(tableCheck[0].count).toBe('1');
    });
  });

  describe('getClient method', () => {
    it('should return a working database client', async () => {
      if (shouldSkipTests) {
        return;
      }

      const client = await connection.getClient();
      
      try {
        const result = await client.query('SELECT 1 as number');
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].number).toBe(1);
      } finally {
        client.release();
      }
    });

    it('should support transactions with client', async () => {
      if (shouldSkipTests) {
        return;
      }

      const client = await connection.getClient();

      try {
        await client.query('BEGIN');
        
        await client.query(
          `INSERT INTO ${testTableName} (name, value) VALUES ($1, $2)`,
          ['tx-item', 999]
        );

        // Verify item exists within transaction
        const result1 = await client.query(
          `SELECT * FROM ${testTableName} WHERE name = $1`,
          ['tx-item']
        );
        expect(result1.rows).toHaveLength(1);

        await client.query('ROLLBACK');

        // Verify item was rolled back
        const result2 = await connection.query(
          `SELECT * FROM ${testTableName} WHERE name = $1`,
          ['tx-item']
        );
        expect(result2).toEqual([]);
      } finally {
        client.release();
      }
    });

    it('should handle multiple clients from pool', async () => {
      if (shouldSkipTests) {
        return;
      }

      const client1 = await connection.getClient();
      const client2 = await connection.getClient();
      const client3 = await connection.getClient();

      try {
        const [result1, result2, result3] = await Promise.all([
          client1.query('SELECT 1 as num'),
          client2.query('SELECT 2 as num'),
          client3.query('SELECT 3 as num'),
        ]);

        expect(result1.rows[0].num).toBe(1);
        expect(result2.rows[0].num).toBe(2);
        expect(result3.rows[0].num).toBe(3);
      } finally {
        client1.release();
        client2.release();
        client3.release();
      }
    });
  });

  describe('testConnection method', () => {
    it('should return true for valid connection', async () => {
      if (shouldSkipTests) {
        return;
      }

      const result = await connection.testConnection();
      expect(result).toBe(true);
    });

    it('should return false for invalid connection', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create connection with invalid config
      const badConnection = new PostgresConnection({
        host: 'invalid-host-that-does-not-exist',
        port: 9999,
        database: 'invalid',
        user: 'invalid',
        password: 'invalid',
        connectionTimeoutMillis: 1000,
      });

      const result = await badConnection.testConnection();
      expect(result).toBe(false);

      await badConnection.end();
    });
  });

  describe('getPoolStats method', () => {
    it('should return pool statistics', async () => {
      if (shouldSkipTests) {
        return;
      }

      const stats = connection.getPoolStats();

      expect(stats).toHaveProperty('totalCount');
      expect(stats).toHaveProperty('idleCount');
      expect(stats).toHaveProperty('waitingCount');
      expect(stats).toHaveProperty('isConnected');

      expect(typeof stats.totalCount).toBe('number');
      expect(typeof stats.idleCount).toBe('number');
      expect(typeof stats.waitingCount).toBe('number');
      expect(typeof stats.isConnected).toBe('boolean');
    });

    it('should show increased totalCount after getting clients', async () => {
      if (shouldSkipTests) {
        return;
      }

      const statsBefore = connection.getPoolStats();
      
      const client1 = await connection.getClient();
      const client2 = await connection.getClient();

      const statsAfter = connection.getPoolStats();
      expect(statsAfter.totalCount).toBeGreaterThanOrEqual(statsBefore.totalCount);

      client1.release();
      client2.release();
    });
  });

  describe('error handling and retry logic', () => {
    it('should wrap errors with context', async () => {
      if (shouldSkipTests) {
        return;
      }

      try {
        await connection.query('SELECT * FROM nonexistent_table');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Database error in');
        expect(error.message).toContain('SELECT * FROM nonexistent_table');
      }
    });

    it('should handle concurrent queries without errors', async () => {
      if (shouldSkipTests) {
        return;
      }

      const promises = Array.from({ length: 10 }, (_, i) =>
        connection.query(
          `INSERT INTO ${testTableName} (name, value) VALUES ($1, $2)`,
          [`concurrent-${i}`, i]
        )
      );

      await expect(Promise.all(promises)).resolves.toBeDefined();

      const result = await connection.query(`SELECT COUNT(*) as count FROM ${testTableName}`);
      expect(result[0].count).toBe('10');
    });
  });

  describe('end method', () => {
    it('should close connection pool gracefully', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create a separate connection for this test
      const tempConnection = new PostgresConnection({
        host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT || '5432', 10),
        database: process.env.TEST_DB_NAME || 'halloween_test',
        user: process.env.TEST_DB_USER || process.env.DB_USER || 'postgres',
        password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || '',
        max: 2,
      });

      // Use the connection
      await tempConnection.query('SELECT 1');

      // Close it
      await expect(tempConnection.end()).resolves.toBeUndefined();

      // Verify it's closed by checking stats
      const stats = tempConnection.getPoolStats();
      expect(stats.totalCount).toBe(0);
    });
  });
});
