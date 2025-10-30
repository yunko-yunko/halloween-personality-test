import { ITestResultRepository } from '../interfaces/ITestResultRepository';
import { TestResult, TestResultInput } from '../../types';

/**
 * No-op test result repository implementation for simple mode
 * Logs operations without persisting results to database
 */
export class NoOpTestResultRepository implements ITestResultRepository {
  /**
   * Returns mock test result without persisting to database
   * @param result - Test result data
   * @returns Mock test result with generated ID and timestamp
   */
  async create(result: TestResultInput): Promise<TestResult> {
    console.log('[NoOpTestResultRepository] create called:', result);
    console.log('[NoOpTestResultRepository] Returning mock result - no persistence in simple mode');
    
    const mockResult: TestResult = {
      id: 'mock-result-id',
      userId: result.userId,
      characterType: result.characterType,
      mbtiType: result.mbtiType,
      completedAt: new Date(),
    };
    
    return mockResult;
  }

  /**
   * Returns empty array as no results are stored in simple mode
   * @param userId - User ID to search for
   * @returns Always returns empty array
   */
  async findByUserId(userId: string): Promise<TestResult[]> {
    console.log('[NoOpTestResultRepository] findByUserId called:', userId);
    console.log('[NoOpTestResultRepository] Returning empty array - no persistence in simple mode');
    return [];
  }
}
