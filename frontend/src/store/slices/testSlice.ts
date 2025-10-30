import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Question,
  HalloweenCharacter,
  CharacterInfo,
  DimensionValue,
} from '../../types';

// ============================================================================
// State Interface
// ============================================================================

export interface TestState {
  questions: Question[];
  answers: Record<string, string>; // questionId -> answerId
  currentPage: number;
  result: {
    character: HalloweenCharacter;
    characterInfo: CharacterInfo;
    mbtiType: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: TestState = {
  questions: [],
  answers: {},
  currentPage: 1,
  result: null,
  isLoading: false,
  error: null,
};

// ============================================================================
// Slice
// ============================================================================

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    // Set questions (loaded from API or JSON)
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.error = null;
    },

    // Set answer for a specific question
    setAnswer: (
      state,
      action: PayloadAction<{ questionId: string; answerId: string }>
    ) => {
      state.answers[action.payload.questionId] = action.payload.answerId;
    },

    // Navigate to next page
    nextPage: (state) => {
      const totalPages = Math.ceil(state.questions.length / 5);
      if (state.currentPage < totalPages) {
        state.currentPage += 1;
      }
    },

    // Navigate to previous page
    prevPage: (state) => {
      if (state.currentPage > 1) {
        state.currentPage -= 1;
      }
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set test result after submission
    submitTestSuccess: (
      state,
      action: PayloadAction<{
        character: HalloweenCharacter;
        characterInfo: CharacterInfo;
        mbtiType: string;
      }>
    ) => {
      state.result = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // Set error
    submitTestFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Reset test (for retaking; set currentPage to "1")
    resetTest: (state) => {
      state.answers = {};
      state.currentPage = state.currentPage - 1;
      state.result = null;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// ============================================================================
// Actions
// ============================================================================

export const {
  setQuestions,
  setAnswer,
  nextPage,
  prevPage,
  setLoading,
  submitTestSuccess,
  submitTestFailure,
  resetTest,
  clearError,
} = testSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

export const selectQuestions = (state: { test: TestState }) => state.test.questions;
export const selectAnswers = (state: { test: TestState }) => state.test.answers;
export const selectCurrentPage = (state: { test: TestState }) => state.test.currentPage;
export const selectResult = (state: { test: TestState }) => state.test.result;
export const selectIsLoading = (state: { test: TestState }) => state.test.isLoading;
export const selectError = (state: { test: TestState }) => state.test.error;

// Get questions for current page (5 per page)
export const selectCurrentPageQuestions = (state: { test: TestState }) => {
  const { questions, currentPage } = state.test;
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;
  return questions.slice(startIndex, endIndex);
};

// Check if all questions on current page are answered
export const selectIsCurrentPageComplete = (state: { test: TestState }) => {
  const currentPageQuestions = selectCurrentPageQuestions(state);
  const { answers } = state.test;
  return currentPageQuestions.every((q) => answers[q.id] !== undefined);
};

// Check if all questions are answered
export const selectIsTestComplete = (state: { test: TestState }) => {
  const { questions, answers } = state.test;
  return questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);
};

// Get total number of pages
export const selectTotalPages = (state: { test: TestState }) => {
  return Math.ceil(state.test.questions.length / 5);
};

// Get answers in submission format
export const selectAnswersForSubmission = (state: { test: TestState }) => {
  const { questions, answers } = state.test;
  return questions.map((question) => {
    const answerId = answers[question.id];
    const answer = question.answers.find((a) => a.id === answerId);
    return {
      questionId: question.id,
      answerId: answerId,
      value: answer?.value as DimensionValue,
    };
  });
};

// ============================================================================
// Reducer
// ============================================================================

export default testSlice.reducer;
