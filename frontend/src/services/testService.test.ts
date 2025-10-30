/**
 * Test Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testService } from './testService';
import api from './api';
import type { GetQuestionsResponse, SubmitTestResponse } from '../types';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('testService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getQuestions', () => {
    it('should call GET /test/questions endpoint', async () => {
      const mockResponse: GetQuestionsResponse = {
        questions: [
          {
            id: 'ei_1',
            text: '테스트 질문',
            dimension: 'EI',
            answers: [
              { id: 'ei_1_a', text: '답변 A', value: 'E' },
              { id: 'ei_1_b', text: '답변 B', value: 'I' },
            ],
          },
        ],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await testService.getQuestions();

      expect(api.get).toHaveBeenCalledWith('/test/questions');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('submitTest', () => {
    it('should call POST /test/submit endpoint with answers', async () => {
      const mockAnswers = [
        { questionId: 'ei_1', answerId: 'ei_1_a', value: 'E' as const },
      ];

      const mockResponse: SubmitTestResponse = {
        character: 'zombie',
        characterInfo: {
          name: '좀비',
          description: '좀비 설명',
          imagePath: '/assets/characters/zombie.png',
          mbtiTypes: ['ESTJ', 'ESTP'],
        },
        mbtiType: 'ESTJ',
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await testService.submitTest(mockAnswers);

      expect(api.post).toHaveBeenCalledWith('/test/submit', { answers: mockAnswers });
      expect(result).toEqual(mockResponse);
    });
  });
});
