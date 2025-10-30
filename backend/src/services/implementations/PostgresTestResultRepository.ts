import { ITestResultRepository } from '../interfaces/ITestResultRepository';
import { TestResult, TestResultInput } from '../../types';
import { IDatabaseConnection } from '../interfaces/IDatabaseConnection';

/**
 * PostgreSQL test result repository implementation
 * Implements test result data access using raw SQL queries with parameterized statements
 */
export class PostgresTestResultRepository implements ITestResultRepository {
  constructor(private connection: IDatabaseConnection) {}

  /**
   * Create new test result
   * @param result - Test result data
   * @returns Created test result with ID and timestamp
   */
  async create(result: TestResultInput): Promise<TestResult> {
    try {
      const sql = `
        INSERT INTO test_results (user_id, character_type, mbti_type, completed_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, user_id as "userId", character_type as "characterType", 
                  mbti_type as "mbtiType", completed_at as "completedAt"
      `;
      
      const rows = await this.connection.query<TestResult>(sql, [
        result.userId,
        result.characterType,
        result.mbtiType,
      ]);
      
      if (rows.length === 0) {
        throw new Error('Failed to create test result: no rows returned');
      }
      
      return this.mapRowToTestResult(rows[0]);
    } catch (error) {
      // Check for foreign key constraint violation
      if ((error as any).code === '23503') {
        console.error('[PostgresTestResultRepository] User not found:', result.userId);
        throw new Error(`User with ID ${result.userId} not found`);
      }
      
      console.error('[PostgresTestResultRepository] Error creating test result:', error);
      throw new Error(`Failed to create test result: ${(error as Error).message}`);
    }
  }

  /**
   * Find all test results for a user
   * @param userId - User ID to search for
   * @returns Array of test results in reverse chronological order
   */
  async findByUserId(userId: string): Promise<TestResult[]> {
    try {
      const sql = `
        SELECT id, user_id as "userId", character_type as "characterType", 
               mbti_type as "mbtiType", completed_at as "completedAt"
        FROM test_results
        WHERE user_id = $1
        ORDER BY completed_at DESC
      `;
      
      const rows = await this.connection.query<TestResult>(sql, [userId]);
      
      return rows.map(row => this.mapRowToTestResult(row));
    } catch (error) {
      console.error('[PostgresTestResultRepository] Error finding test results by user ID:', error);
      throw new Error(`Failed to find test results: ${(error as Error).message}`);
    }
  }

  /**
   * Map database row to TestResult object
   * Ensures proper type conversion for dates
   */
  private mapRowToTestResult(row: any): TestResult {
    return {
      id: row.id,
      userId: row.userId,
      characterType: row.characterType,
      mbtiType: row.mbtiType,
      completedAt: row.completedAt instanceof Date ? row.completedAt : new Date(row.completedAt),
    };
  }
}
