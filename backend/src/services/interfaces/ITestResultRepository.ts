import { TestResult, TestResultInput } from '../../types';

/**
 * Interface for test result data access
 * Supports both PostgreSQL and no-op implementations based on feature flags
 */
export interface ITestResultRepository {
  /**
   * Create new test result
   * @param result - Test result data
   * @returns Created test result with ID and timestamp
   */
  create(result: TestResultInput): Promise<TestResult>;

  /**
   * Find all test results for a user
   * @param userId - User ID to search for
   * @returns Array of test results in reverse chronological order
   */
  findByUserId(userId: string): Promise<TestResult[]>;
}
