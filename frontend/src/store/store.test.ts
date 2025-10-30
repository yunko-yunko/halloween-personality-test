import { describe, it, expect } from 'vitest';
import { store } from './store';
import { setQuestions, setAnswer } from './slices/testSlice';
import { setUser, clearAuth } from './slices/authSlice';
import type { Question, User } from '../types';

// ============================================================================
// Store Integration Tests
// ============================================================================

describe('Redux Store Integration', () => {
  it('should have test and auth reducers', () => {
    const state = store.getState();
    expect(state).toHaveProperty('test');
    expect(state).toHaveProperty('auth');
  });

  it('should handle test actions', () => {
    const mockQuestions: Question[] = [
      {
        id: 'test_1',
        text: 'Test question',
        dimension: 'EI',
        answers: [
          { id: 'a1', text: 'Answer 1', value: 'E' },
          { id: 'a2', text: 'Answer 2', value: 'I' },
        ],
      },
    ];

    store.dispatch(setQuestions(mockQuestions));
    let state = store.getState();
    expect(state.test.questions).toHaveLength(1);

    store.dispatch(setAnswer({ questionId: 'test_1', answerId: 'a1' }));
    state = store.getState();
    expect(state.test.answers['test_1']).toBe('a1');
  });

  it('should handle auth actions', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.dispatch(setUser(mockUser));
    let state = store.getState();
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.user).toEqual(mockUser);

    store.dispatch(clearAuth());
    state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
  });

  it('should maintain independent state for test and auth', () => {
    const mockQuestions: Question[] = [
      {
        id: 'test_1',
        text: 'Test question',
        dimension: 'EI',
        answers: [
          { id: 'a1', text: 'Answer 1', value: 'E' },
          { id: 'a2', text: 'Answer 2', value: 'I' },
        ],
      },
    ];

    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Set test state
    store.dispatch(setQuestions(mockQuestions));
    
    // Set auth state
    store.dispatch(setUser(mockUser));

    const state = store.getState();
    
    // Both states should be maintained
    expect(state.test.questions).toHaveLength(1);
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.user).toEqual(mockUser);
  });
});
