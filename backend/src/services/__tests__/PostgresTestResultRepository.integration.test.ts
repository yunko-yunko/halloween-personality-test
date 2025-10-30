import { PostgresTestResultRepository } from '../implementations/PostgresTestResultRepository';
import { PostgresUserRepository } from '../implementations/PostgresUserRepository';
import { PostgresConnection } from '../implementations/PostgresConnection';
import { TestResultInput, HalloweenCharacter } from '../../types';
import { PoolConfig } from 'pg';

/**
 * Integration tests for PostgresTestResultRepository
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
 * SKIP_INTEGRATION_TESTS=false npm test -- PostgresTestResultRepository.integration.test.ts
 */

describe('PostgresTestResultRepository Integration Tests', () => {
  let connection: PostgresConnection;
  let repository: PostgresTestResultRepository;
  let userRepository: PostgresUserRepository;
  let testUserId: string;

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
    repository = new PostgresTestResultRepository(connection);
    userRepository = new PostgresUserRepository(connection);

    // Verify tables exist
    try {
      await connection.query('SELECT 1 FROM users LIMIT 1');
      await connection.query('SELECT 1 FROM test_results LIMIT 1');
    } catch (error) {
      console.error('Required tables do not exist. Please run migrations first.');
      throw error;
    }

    // Create a test user for all tests
    const testUser = await userRepository.create('test-results@example.com');
    testUserId = testUser.id;
  });

  afterAll(async () => {
    if (shouldSkipTests || !connection) {
      return;
    }

    // Clean up test data
    await connection.query("DELETE FROM users WHERE email = 'test-results@example.com'");
    
    await connection.end();
  });

  beforeEach(async () => {
    if (shouldSkipTests) {
      return;
    }

    // Clean up test results before each test
    await connection.query('DELETE FROM test_results WHERE user_id = $1', [testUserId]);
  });

  describe('create', () => {
    it('should create a new test result', async () => {
      if (shouldSkipTests) {
        return;
      }

      const input: TestResultInput = {
        userId: testUserId,
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      };

      const result = await repository.create(input);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.characterType).toBe('zombie');
      expect(result.mbtiType).toBe('ESTJ');
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.completedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should create test results for all character types', async () => {
      if (shouldSkipTests) {
        return;
      }

      const characters: Array<{ character: HalloweenCharacter; mbti: string }> = [
        { character: 'zombie', mbti: 'ESTJ' },
        { character: 'joker', mbti: 'ENTJ' },
        { character: 'skeleton', mbti: 'INFJ' },
        { character: 'nun', mbti: 'ISFJ' },
        { character: 'jack-o-lantern', mbti: 'ENFJ' },
        { character: 'vampire', mbti: 'ISTJ' },
        { character: 'ghost', mbti: 'ESFJ' },
        { character: 'frankenstein', mbti: 'INTJ' },
      ];

      for (const { character, mbti } of characters) {
        const input: TestResultInput = {
          userId: testUserId,
          characterType: character,
          mbtiType: mbti,
        };

        const result = await repository.create(input);
        expect(result.characterType).toBe(character);
        expect(result.mbtiType).toBe(mbti);
      }
    });

    it('should throw error when creating result for non-existent user', async () => {
      if (shouldSkipTests) {
        return;
      }

      const input: TestResultInput = {
        userId: '00000000-0000-0000-0000-000000000000',
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      };

      await expect(repository.create(input)).rejects.toThrow('not found');
    });

    it('should create multiple results for same user', async () => {
      if (shouldSkipTests) {
        return;
      }

      const result1 = await repository.create({
        userId: testUserId,
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      });

      const result2 = await repository.create({
        userId: testUserId,
        characterType: 'vampire',
        mbtiType: 'ISTJ',
      });

      const result3 = await repository.create({
        userId: testUserId,
        characterType: 'ghost',
        mbtiType: 'ESFJ',
      });

      expect(result1.id).not.toBe(result2.id);
      expect(result2.id).not.toBe(result3.id);
      expect(result1.characterType).toBe('zombie');
      expect(result2.characterType).toBe('vampire');
      expect(result3.characterType).toBe('ghost');
    });

    it('should handle concurrent result creation', async () => {
      if (shouldSkipTests) {
        return;
      }

      const promises = Array.from({ length: 5 }, (_, i) =>
        repository.create({
          userId: testUserId,
          characterType: 'zombie',
          mbtiType: 'ESTJ',
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      const ids = results.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5); // All IDs should be unique
    });
  });

  describe('findByUserId', () => {
    it('should return empty array for user with no results', async () => {
      if (shouldSkipTests) {
        return;
      }

      const results = await repository.findByUserId(testUserId);

      expect(results).toEqual([]);
    });

    it('should find all results for a user', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create multiple results
      await repository.create({
        userId: testUserId,
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      });

      await repository.create({
        userId: testUserId,
        characterType: 'vampire',
        mbtiType: 'ISTJ',
      });

      await repository.create({
        userId: testUserId,
        characterType: 'ghost',
        mbtiType: 'ESFJ',
      });

      const results = await repository.findByUserId(testUserId);

      expect(results).toHaveLength(3);
      expect(results[0].userId).toBe(testUserId);
      expect(results[1].userId).toBe(testUserId);
      expect(results[2].userId).toBe(testUserId);
    });

    it('should return results in reverse chronological order', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create results with small delays to ensure different timestamps
      const result1 = await repository.create({
        userId: testUserId,
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const result2 = await repository.create({
        userId: testUserId,
        characterType: 'vampire',
        mbtiType: 'ISTJ',
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const result3 = await repository.create({
        userId: testUserId,
        characterType: 'ghost',
        mbtiType: 'ESFJ',
      });

      const results = await repository.findByUserId(testUserId);

      expect(results).toHaveLength(3);
      // Most recent first
      expect(results[0].id).toBe(result3.id);
      expect(results[1].id).toBe(result2.id);
      expect(results[2].id).toBe(result1.id);
      
      // Verify timestamps are in descending order
      expect(results[0].completedAt.getTime()).toBeGreaterThanOrEqual(
        results[1].completedAt.getTime()
      );
      expect(results[1].completedAt.getTime()).toBeGreaterThanOrEqual(
        results[2].completedAt.getTime()
      );
    });

    it('should only return results for specified user', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create another user
      const otherUser = await userRepository.create('test-other-user@example.com');

      // Create results for both users
      await repository.create({
        userId: testUserId,
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      });

      await repository.create({
        userId: otherUser.id,
        characterType: 'vampire',
        mbtiType: 'ISTJ',
      });

      const results = await repository.findByUserId(testUserId);

      expect(results).toHaveLength(1);
      expect(results[0].userId).toBe(testUserId);
      expect(results[0].characterType).toBe('zombie');

      // Clean up
      await connection.query('DELETE FROM users WHERE id = $1', [otherUser.id]);
    });

    it('should return empty array for non-existent user', async () => {
      if (shouldSkipTests) {
        return;
      }

      const results = await repository.findByUserId('00000000-0000-0000-0000-000000000000');

      expect(results).toEqual([]);
    });

    it('should handle concurrent findByUserId calls', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create some results
      await repository.create({
        userId: testUserId,
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      });

      await repository.create({
        userId: testUserId,
        characterType: 'vampire',
        mbtiType: 'ISTJ',
      });

      const promises = Array.from({ length: 10 }, () =>
        repository.findByUserId(testUserId)
      );

      const results = await Promise.all(promises);

      results.forEach(userResults => {
        expect(userResults).toHaveLength(2);
        expect(userResults[0].userId).toBe(testUserId);
        expect(userResults[1].userId).toBe(testUserId);
      });
    });
  });

  describe('SQL injection prevention', () => {
    it('should prevent SQL injection in create', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Attempt SQL injection in character type
      const maliciousInput: TestResultInput = {
        userId: testUserId,
        characterType: "zombie'; DROP TABLE test_results; --" as any,
        mbtiType: 'ESTJ',
      };

      // Should safely store the malicious string
      const result = await repository.create(maliciousInput);
      expect(result.characterType).toBe("zombie'; DROP TABLE test_results; --");

      // Verify table still exists
      const tableCheck = await connection.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'test_results'
        ) as exists
      `);
      expect(tableCheck[0].exists).toBe(true);
    });

    it('should prevent SQL injection in findByUserId', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create a legitimate result
      await repository.create({
        userId: testUserId,
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      });

      // Attempt SQL injection
      const maliciousUserId = "' OR '1'='1";
      const results = await repository.findByUserId(maliciousUserId);

      // Should return empty array, not all results
      expect(results).toEqual([]);
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

      const badRepository = new PostgresTestResultRepository(badConnection);

      await expect(
        badRepository.findByUserId(testUserId)
      ).rejects.toThrow();

      await badConnection.end();
    });

    it('should handle invalid UUID in findByUserId', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Invalid UUID format should be handled gracefully
      await expect(
        repository.findByUserId('not-a-valid-uuid')
      ).rejects.toThrow();
    });

    it('should handle invalid UUID in create', async () => {
      if (shouldSkipTests) {
        return;
      }

      const input: TestResultInput = {
        userId: 'not-a-valid-uuid',
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      };

      await expect(repository.create(input)).rejects.toThrow();
    });
  });

  describe('data type handling', () => {
    it('should correctly handle Date objects', async () => {
      if (shouldSkipTests) {
        return;
      }

      const result = await repository.create({
        userId: testUserId,
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      });

      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.completedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should preserve character type and MBTI type exactly', async () => {
      if (shouldSkipTests) {
        return;
      }

      const testCases: Array<{ character: HalloweenCharacter; mbti: string }> = [
        { character: 'zombie', mbti: 'ESTJ' },
        { character: 'jack-o-lantern', mbti: 'ENFP' },
        { character: 'frankenstein', mbti: 'INTJ' },
      ];

      for (const { character, mbti } of testCases) {
        const result = await repository.create({
          userId: testUserId,
          characterType: character,
          mbtiType: mbti,
        });

        expect(result.characterType).toBe(character);
        expect(result.mbtiType).toBe(mbti);

        const found = await repository.findByUserId(testUserId);
        const foundResult = found.find(r => r.id === result.id);
        expect(foundResult?.characterType).toBe(character);
        expect(foundResult?.mbtiType).toBe(mbti);
      }
    });
  });

  describe('cascade deletion', () => {
    it('should delete test results when user is deleted', async () => {
      if (shouldSkipTests) {
        return;
      }

      // Create a temporary user
      const tempUser = await userRepository.create('test-cascade@example.com');

      // Create results for temp user
      await repository.create({
        userId: tempUser.id,
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      });

      await repository.create({
        userId: tempUser.id,
        characterType: 'vampire',
        mbtiType: 'ISTJ',
      });

      // Verify results exist
      let results = await repository.findByUserId(tempUser.id);
      expect(results).toHaveLength(2);

      // Delete user (should cascade to test_results)
      await connection.query('DELETE FROM users WHERE id = $1', [tempUser.id]);

      // Verify results are deleted
      results = await repository.findByUserId(tempUser.id);
      expect(results).toEqual([]);
    });
  });
});
