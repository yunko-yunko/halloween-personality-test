import { describe, it, expect, beforeEach } from 'vitest';
import testReducer, {
  setQuestions,
  setAnswer,
  nextPage,
  prevPage,
  setLoading,
  submitTestSuccess,
  submitTestFailure,
  resetTest,
  clearError,
  selectCurrentPageQuestions,
  selectIsCurrentPageComplete,
  selectIsTestComplete,
  selectTotalPages,
  selectAnswersForSubmission,
  type TestState,
} from './testSlice';
import type { Question, HalloweenCharacter, CharacterInfo } from '../../types';

// ============================================================================
// Mock Data
// ============================================================================

const mockQuestions: Question[] = [
  {
    id: 'ei_1',
    text: '질문 1',
    dimension: 'EI',
    answers: [
      { id: 'ei_1_a', text: '답변 A', value: 'E' },
      { id: 'ei_1_b', text: '답변 B', value: 'I' },
    ],
  },
  {
    id: 'ei_2',
    text: '질문 2',
    dimension: 'EI',
    answers: [
      { id: 'ei_2_a', text: '답변 A', value: 'E' },
      { id: 'ei_2_b', text: '답변 B', value: 'I' },
    ],
  },
  {
    id: 'ns_1',
    text: '질문 3',
    dimension: 'NS',
    answers: [
      { id: 'ns_1_a', text: '답변 A', value: 'N' },
      { id: 'ns_1_b', text: '답변 B', value: 'S' },
    ],
  },
  {
    id: 'ns_2',
    text: '질문 4',
    dimension: 'NS',
    answers: [
      { id: 'ns_2_a', text: '답변 A', value: 'N' },
      { id: 'ns_2_b', text: '답변 B', value: 'S' },
    ],
  },
  {
    id: 'tf_1',
    text: '질문 5',
    dimension: 'TF',
    answers: [
      { id: 'tf_1_a', text: '답변 A', value: 'T' },
      { id: 'tf_1_b', text: '답변 B', value: 'F' },
    ],
  },
  {
    id: 'tf_2',
    text: '질문 6',
    dimension: 'TF',
    answers: [
      { id: 'tf_2_a', text: '답변 A', value: 'T' },
      { id: 'tf_2_b', text: '답변 B', value: 'F' },
    ],
  },
];

const mockCharacterInfo: CharacterInfo = {
  name: '좀비',
  description: '좀비 설명',
  imagePath: '/assets/characters/zombie.png',
  mbtiTypes: ['ESTJ', 'ESTP'],
};

// ============================================================================
// Tests
// ============================================================================

describe('testSlice', () => {
  let initialState: TestState;

  beforeEach(() => {
    initialState = {
      questions: [],
      answers: {},
      currentPage: 1,
      result: null,
      isLoading: false,
      error: null,
    };
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(testReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('setQuestions', () => {
    it('should set questions', () => {
      const state = testReducer(initialState, setQuestions(mockQuestions));
      expect(state.questions).toEqual(mockQuestions);
      expect(state.error).toBeNull();
    });

    it('should clear error when setting questions', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const state = testReducer(stateWithError, setQuestions(mockQuestions));
      expect(state.error).toBeNull();
    });
  });

  describe('setAnswer', () => {
    it('should set answer for a question', () => {
      const state = testReducer(
        initialState,
        setAnswer({ questionId: 'ei_1', answerId: 'ei_1_a' })
      );
      expect(state.answers['ei_1']).toBe('ei_1_a');
    });

    it('should update existing answer', () => {
      const stateWithAnswer = {
        ...initialState,
        answers: { ei_1: 'ei_1_a' },
      };
      const state = testReducer(
        stateWithAnswer,
        setAnswer({ questionId: 'ei_1', answerId: 'ei_1_b' })
      );
      expect(state.answers['ei_1']).toBe('ei_1_b');
    });

    it('should handle multiple answers', () => {
      let state = testReducer(
        initialState,
        setAnswer({ questionId: 'ei_1', answerId: 'ei_1_a' })
      );
      state = testReducer(state, setAnswer({ questionId: 'ei_2', answerId: 'ei_2_b' }));
      expect(state.answers).toEqual({
        ei_1: 'ei_1_a',
        ei_2: 'ei_2_b',
      });
    });
  });

  describe('nextPage', () => {
    it('should increment current page', () => {
      const stateWithQuestions = {
        ...initialState,
        questions: mockQuestions,
        currentPage: 1,
      };
      const state = testReducer(stateWithQuestions, nextPage());
      expect(state.currentPage).toBe(2);
    });

    it('should not exceed total pages', () => {
      const stateWithQuestions = {
        ...initialState,
        questions: mockQuestions, // 6 questions = 2 pages
        currentPage: 2,
      };
      const state = testReducer(stateWithQuestions, nextPage());
      expect(state.currentPage).toBe(2);
    });
  });

  describe('prevPage', () => {
    it('should decrement current page', () => {
      const stateWithQuestions = {
        ...initialState,
        questions: mockQuestions,
        currentPage: 2,
      };
      const state = testReducer(stateWithQuestions, prevPage());
      expect(state.currentPage).toBe(1);
    });

    it('should not go below page 1', () => {
      const state = testReducer(initialState, prevPage());
      expect(state.currentPage).toBe(1);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const state = testReducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('should set loading to false', () => {
      const stateWithLoading = { ...initialState, isLoading: true };
      const state = testReducer(stateWithLoading, setLoading(false));
      expect(state.isLoading).toBe(false);
    });
  });

  describe('submitTestSuccess', () => {
    it('should set result and clear loading/error', () => {
      const result = {
        character: 'zombie' as HalloweenCharacter,
        characterInfo: mockCharacterInfo,
        mbtiType: 'ESTJ',
      };
      const stateWithLoading = { ...initialState, isLoading: true, error: 'Some error' };
      const state = testReducer(stateWithLoading, submitTestSuccess(result));
      expect(state.result).toEqual(result);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('submitTestFailure', () => {
    it('should set error and clear loading', () => {
      const stateWithLoading = { ...initialState, isLoading: true };
      const state = testReducer(stateWithLoading, submitTestFailure('Test error'));
      expect(state.error).toBe('Test error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('resetTest', () => {
    it('should reset test state', () => {
      const stateWithData = {
        ...initialState,
        questions: mockQuestions,
        answers: { ei_1: 'ei_1_a', ei_2: 'ei_2_b' },
        currentPage: 2,
        result: {
          character: 'zombie' as HalloweenCharacter,
          characterInfo: mockCharacterInfo,
          mbtiType: 'ESTJ',
        },
        error: 'Some error',
      };
      const state = testReducer(stateWithData, resetTest());
      expect(state.answers).toEqual({});
      expect(state.currentPage).toBe(1);
      expect(state.result).toBeNull();
      expect(state.error).toBeNull();
      expect(state.questions).toEqual(mockQuestions); // Questions should remain
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const state = testReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockState = {
      test: {
        questions: mockQuestions,
        answers: {
          ei_1: 'ei_1_a',
          ei_2: 'ei_2_b',
          ns_1: 'ns_1_a',
        },
        currentPage: 1,
        result: null,
        isLoading: false,
        error: null,
      },
    };

    describe('selectCurrentPageQuestions', () => {
      it('should return questions for page 1', () => {
        const questions = selectCurrentPageQuestions(mockState);
        expect(questions).toHaveLength(5);
        expect(questions[0].id).toBe('ei_1');
        expect(questions[4].id).toBe('tf_1');
      });

      it('should return questions for page 2', () => {
        const state = {
          test: { ...mockState.test, currentPage: 2 },
        };
        const questions = selectCurrentPageQuestions(state);
        expect(questions).toHaveLength(1);
        expect(questions[0].id).toBe('tf_2');
      });
    });

    describe('selectIsCurrentPageComplete', () => {
      it('should return false when not all questions are answered', () => {
        const isComplete = selectIsCurrentPageComplete(mockState);
        expect(isComplete).toBe(false);
      });

      it('should return true when all questions on page are answered', () => {
        const state = {
          test: {
            ...mockState.test,
            answers: {
              ei_1: 'ei_1_a',
              ei_2: 'ei_2_b',
              ns_1: 'ns_1_a',
              ns_2: 'ns_2_b',
              tf_1: 'tf_1_a',
            },
          },
        };
        const isComplete = selectIsCurrentPageComplete(state);
        expect(isComplete).toBe(true);
      });
    });

    describe('selectIsTestComplete', () => {
      it('should return false when not all questions are answered', () => {
        const isComplete = selectIsTestComplete(mockState);
        expect(isComplete).toBe(false);
      });

      it('should return true when all questions are answered', () => {
        const state = {
          test: {
            ...mockState.test,
            answers: {
              ei_1: 'ei_1_a',
              ei_2: 'ei_2_b',
              ns_1: 'ns_1_a',
              ns_2: 'ns_2_b',
              tf_1: 'tf_1_a',
              tf_2: 'tf_2_b',
            },
          },
        };
        const isComplete = selectIsTestComplete(state);
        expect(isComplete).toBe(true);
      });

      it('should return false when no questions loaded', () => {
        const state = {
          test: { ...mockState.test, questions: [] },
        };
        const isComplete = selectIsTestComplete(state);
        expect(isComplete).toBe(false);
      });
    });

    describe('selectTotalPages', () => {
      it('should calculate total pages correctly', () => {
        const totalPages = selectTotalPages(mockState);
        expect(totalPages).toBe(2); // 6 questions / 5 per page = 2 pages
      });

      it('should handle empty questions', () => {
        const state = {
          test: { ...mockState.test, questions: [] },
        };
        const totalPages = selectTotalPages(state);
        expect(totalPages).toBe(0);
      });
    });

    describe('selectAnswersForSubmission', () => {
      it('should format answers for API submission', () => {
        const state = {
          test: {
            ...mockState.test,
            answers: {
              ei_1: 'ei_1_a',
              ei_2: 'ei_2_b',
              ns_1: 'ns_1_a',
              ns_2: 'ns_2_b',
              tf_1: 'tf_1_a',
              tf_2: 'tf_2_b',
            },
          },
        };
        const answers = selectAnswersForSubmission(state);
        expect(answers).toHaveLength(6);
        expect(answers[0]).toEqual({
          questionId: 'ei_1',
          answerId: 'ei_1_a',
          value: 'E',
        });
        expect(answers[1]).toEqual({
          questionId: 'ei_2',
          answerId: 'ei_2_b',
          value: 'I',
        });
      });
    });
  });
});
