// ============================================================================
// Redux Store Exports
// ============================================================================

export { store } from './store';
export type { RootState, AppDispatch } from './store';
export { useAppDispatch, useAppSelector } from './hooks';

// Test Slice
export {
  setQuestions,
  setAnswer,
  nextPage,
  prevPage,
  setLoading,
  submitTestSuccess,
  submitTestFailure,
  resetTest,
  clearError as clearTestError,
  selectQuestions,
  selectAnswers,
  selectCurrentPage,
  selectResult,
  selectIsLoading,
  selectError,
  selectCurrentPageQuestions,
  selectIsCurrentPageComplete,
  selectIsTestComplete,
  selectTotalPages,
  selectAnswersForSubmission,
} from './slices/testSlice';
export type { TestState } from './slices/testSlice';

// Auth Slice
export {
  // Async thunks
  login,
  checkAuth,
  logoutUser,
  // Synchronous actions
  setUser,
  clearError as clearAuthError,
  clearAuth,
  // Selectors
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  selectAuthError,
} from './slices/authSlice';
export type { AuthState } from './slices/authSlice';
