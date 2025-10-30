/**
 * Test Service
 * Handles API calls related to the personality test
 */

import api from './api';
import type {
  GetQuestionsResponse,
  SubmitTestRequest,
  SubmitTestResponse,
} from '../types';

/**
 * Test service object containing all test-related API methods
 */
export const testService = {
  /**
   * Get all test questions from the backend
   * @returns Promise with questions array
   */
  async getQuestions(): Promise<GetQuestionsResponse> {
    const response = await api.get<GetQuestionsResponse>('/test/questions');
    return response.data;
  },

  /**
   * Submit test answers and get the result
   * @param answers - Array of user's answers to all questions
   * @returns Promise with character result and info
   */
  async submitTest(answers: SubmitTestRequest['answers']): Promise<SubmitTestResponse> {
    const response = await api.post<SubmitTestResponse>('/test/submit', { answers });
    return response.data;
  },
};
