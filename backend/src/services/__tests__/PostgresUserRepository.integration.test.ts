import { PostgresUserRepository } from '../implementations/PostgresUserRepository';
import { PostgresConnection } from '../implementations/PostgresConnection';
import { PoolConfig } from 'pg';

/**
 * Integration tests for PostgresUserRepository
 * 
 * These tests require a running PostgreSQL database with migrations applied.
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
 * SKIP_INTEGRATION_TESTS=false npm test -- PostgresUserRepository.integration.test.ts
 */

describe('PostgresUserRepository Integration Tests', () => {
  let connection: PostgresConnection;
  let repository: PostgresUserRepository;

  // Check if we should skip these tests
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
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 2000,
    };

    connection = new PostgresConnection(testConfig);
    repository = new PostgresUserRepository(connection);

    // Verify users table exists
    try {
      await connection.query('SELECT 1 FROM users LIMIT 1');
    } catch (error) {
      console.error('Users table does not exist. Please run migrations first.');
      throw error;
    }
  });

  afterAll(async () => {
    if (shouldSkipTests || !connection) {
      return;
    }

    await connection.end();
  });

  beforeEach(async () => {
    if (shouldSkipTests) {
      return;
    }

    // Clean up test data before each test
    await connection.query("DELETE FROM users WHERE email LIKE 'test-%@example.com'");
  });

  describe('create', () => {
    it('should create a new user with valid email', async () => {
      if (shouldSkipTests) {
        return;
      }

      const email = 'test-create@example.com';
      const user = await repository.create(email);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when creating user with duplicate email', async () => {
      if (shouldSkipTests) {
        return;
      }

      const email = 'test-duplicate@example.com';
      
      // Create first user
      await repository.create(email);

      // Attempt to create duplicate
      await expect(repository.create(email)).rejects.toThrow('already exists');
    });

    it('should create multiple users with different emails', async () => {
      if (shouldSkipTests) {
        return;
      }

      const user1 = await repository.create('test-user1@example.com');
      const user2 = await repository.create('test-user2@example.com');
      const user3 = await repository.create('test-user3@example.com');

      expect(user1.id).not.toBe(user2.id);
      expect(user2.id).not.toBe(user3.id);
      expect(user1.email).toBe('test-user1@example.com');
      expect(user2.email).toBe('test-user2@example.com');
      expect(user3.email).toBe('test-user3@example.com');
    });

    it('should handle email with special characters', async () => {
      if (shouldSkipTests) {
        return;
      }

      const email = 'test-special+tag@example.com';
      const user = await repository.create(email);

      expect(user.email).toBe(email);
    });
  });

  describe('findByEmail', () => {
    it('should find existing user by email', async () => {
      if (shouldSkipTests) {
        return;
      }

      const email = 'test-find@example.com';
      const createdUser = await repository.create(email);

      const foundUser = await repository.findByEmail(email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(email);
      expect(foundUser?.createdAt).toBeInstanceOf(Date);
      expect(foundUser?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent email', async () => {
      if (shouldSkipTests) {
        return;
      }

      const user = await repository.findByEmail('test-nonexistent@example.com');

      expect(user).toBeNull();
    });

    it('should be case-sensitive for email search', async () => {
      if (shouldSkipTests) {
        return;
      }

      const email = 'test-case@example.com';
      await repository.create(email);

      const foundLower = await repository.findByEmail(email);
      const foundUpper = await repository.findByEmail('TEST-CASE@EXAMPLE.COM');

      expect(foundLower).toBeDefined();
      // PostgreSQL email comparison depends on collation, but typically case-sensitive
      // This test documents the behavior
      expect(foundUpper).toBeNull();
    });

    it('should handle concurrent findByEmail calls', async () => {
      if (shouldSkipTests) {
        return;
      }

      const email = 'test-concurrent@example.com';
      await repository.create(email);

      const promises = Array.from({ length: 10 }, () =>
        repository.findByEmail(email)
      );

      const results = await Promise.all(promises);

      results.forEach(user => {
        expect(user).toBeDefined();
        expect(user?.email).toBe(email);
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login timestamp', async () => {
      if (shouldSkipTests) {
        return;
      }

      const email = 'test-update@example.com';
      const user = await repository.create(email);

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      await repository.updateLastLogin(user.id);

      // Verify update by fetching user again
      const updatedUser = await repository.findByEmail(email);
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
    });

    it('should not throw error for non-existent user ID', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Should complete without error even if user doesn't exist
      await expect(
        repository.updateLastLogin('00000000-0000-0000-0000-000000000000')
      ).resolves.toBeUndefined();
    });

    it('should handle multiple concurrent updates', async () => {
      if (shouldSkipTests) {
        return;
      }

      const email = 'test-concurrent-update@example.com';
      const user = await repository.create(email);

      const promises = Array.from({ length: 5 }, () =>
        repository.updateLastLogin(user.id)
      );

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });

  describe('SQL injection prevention', () => {
    it('should prevent SQL injection in findByEmail', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create a legitimate user
      await repository.create('test-legitimate@example.com');

      // Attempt SQL injection
      const maliciousEmail = "' OR '1'='1";
      const result = await repository.findByEmail(maliciousEmail);

      // Should return null, not all users
      expect(result).toBeNull();
    });

    it('should prevent SQL injection in create', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Attempt SQL injection in email
      const maliciousEmail = "test@example.com'; DROP TABLE users; --";
      
      // Should create user with the malicious string as email (safely escaped)
      const user = await repository.create(maliciousEmail);
      expect(user.email).toBe(maliciousEmail);

      // Verify users table still exists
      const tableCheck = await connection.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists
      `);
      expect(tableCheck[0].exists).toBe(true);

      // Clean up
      await connection.query('DELETE FROM users WHERE email = $1', [maliciousEmail]);
    });
  });

  describe('error handling', () => {
    it('should throw descriptive error for database connection failure', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create repository with bad connection
      const badConnection = new PostgresConnection({
        host: 'invalid-host',
        port: 9999,
        database: 'invalid',
        user: 'invalid',
        password: 'invalid',
        connectionTimeoutMillis: 1000,
      });

      const badRepository = new PostgresUserRepository(badConnection);

      await expect(
        badRepository.findByEmail('test@example.com')
      ).rejects.toThrow();

      await badConnection.end();
    });

    it('should handle invalid UUID in updateLastLogin', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Invalid UUID format should be handled gracefully
      await expect(
        repository.updateLastLogin('not-a-valid-uuid')
      ).rejects.toThrow();
    });
  });

  describe('data type handling', () => {
    it('should correctly handle Date objects', async () => {
      if (shouldSkipTests) {
        return;
      }

      const email = 'test-dates@example.com';
      const user = await repository.create(email);

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should preserve email exactly as provided', async () => {
      if (shouldSkipTests) {
        return;
      }

      const emails = [
        'test-simple@example.com',
        'test.with.dots@example.com',
        'test+tag@example.com',
        'test_underscore@example.com',
      ];

      for (const email of emails) {
        const user = await repository.create(email);
        expect(user.email).toBe(email);

        const found = await repository.findByEmail(email);
        expect(found?.email).toBe(email);
      }
    });
  });
});
