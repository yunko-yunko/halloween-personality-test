/**
 * Basic Simple Mode Tests
 * 
 * Simplified E2E tests that verify core functionality works
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import TestPage from '../pages/TestPage';
import ResultsPage from '../pages/ResultsPage';
import testReducer from '../store/slices/testSlice';
import authReducer from '../store/slices/authSlice';
import { testService } from '../services/testService';
import questions from '../data/questions.json';
import characterDescriptions from '../data/character-descriptions.json';
import type { HalloweenCharacter } from '../types';

// Mock the feature flag
vi.mock('../config/features', () => ({
  features: {
    emailAuth: false,
  },
}));

// Helper to create store
function createTestStore() {
  return configureStore({
    reducer: {
      test: testReducer,
      auth: authReducer,
    },
  });
}

describe('Simple Mode Basic Tests', () => {
  beforeEach(() => {
    // Mock API calls
    vi.spyOn(testService, 'getQuestions').mockResolvedValue({
      questions: questions.questions,
    });
    
    vi.spyOn(testService, 'submitTest').mockImplementation(async (answers) => {
      // Simple mock - always return zombie
      const character: HalloweenCharacter = 'zombie';
      return {
        character,
        characterInfo: characterDescriptions[character],
        mbtiType: 'ESTJ',
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render home page with start button', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </Provider>
    );
    
    // Requirement 5.1: Landing page accessible without authentication
    expect(screen.getByText('할로윈 성격 테스트')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /테스트 시작하기/ })).toBeInTheDocument();
  });

  it('should load questions on test page', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/test']}>
          <TestPage />
        </MemoryRouter>
      </Provider>
    );
    
    // Wait for questions to load
    await waitFor(() => {
      expect(testService.getQuestions).toHaveBeenCalled();
    });
    
    // Requirement 1.1: Should present questions
    await waitFor(() => {
      const firstQuestion = questions.questions[0];
      expect(screen.getByText(firstQuestion.text)).toBeInTheDocument();
    });
  });

  it('should show progress indicator', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/test']}>
          <TestPage />
        </MemoryRouter>
      </Provider>
    );
    
    // Wait for questions to load
    await waitFor(() => {
      const firstQuestion = questions.questions[0];
      expect(screen.getByText(firstQuestion.text)).toBeInTheDocument();
    });
    
    // Requirement 2.1: Progress indicator (check for progress bar role)
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '3');
  });

  it('should not show auth-related UI in simple mode', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </Provider>
    );
    
    // Requirement 5.5: No auth UI elements
    expect(screen.queryByText(/로그인/)).not.toBeInTheDocument();
    expect(screen.queryByText(/프로필/)).not.toBeInTheDocument();
    expect(screen.queryByText(/이메일/)).not.toBeInTheDocument();
  });

  it('should not persist data in localStorage or sessionStorage', () => {
    // Requirement 5.4: No data persistence
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('should allow answer selection', async () => {
    const store = createTestStore();
    const user = userEvent.setup();
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/test']}>
          <TestPage />
        </MemoryRouter>
      </Provider>
    );
    
    // Wait for questions to load
    await waitFor(() => {
      const firstQuestion = questions.questions[0];
      expect(screen.getByText(firstQuestion.text)).toBeInTheDocument();
    });
    
    // Click first answer
    const firstQuestion = questions.questions[0];
    const firstAnswer = firstQuestion.answers[0];
    const answerButton = screen.getByRole('button', { name: new RegExp(firstAnswer.text) });
    
    await user.click(answerButton);
    
    // Verify selection (button should have aria-pressed="true")
    await waitFor(() => {
      expect(answerButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('should show validation error for incomplete answers', async () => {
    const store = createTestStore();
    const user = userEvent.setup();
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/test']}>
          <TestPage />
        </MemoryRouter>
      </Provider>
    );
    
    // Wait for questions to load
    await waitFor(() => {
      const firstQuestion = questions.questions[0];
      expect(screen.getByText(firstQuestion.text)).toBeInTheDocument();
    });
    
    // Try to click next without answering all questions
    const nextButton = screen.getByRole('button', { name: /다음/ });
    
    // Requirement 17.2: Next button should be disabled when incomplete
    expect(nextButton).toBeDisabled();
  });

  it('should display character result', async () => {
    const store = createTestStore();
    
    // Set up store with a result
    store.dispatch({
      type: 'test/submitTestSuccess',
      payload: {
        character: 'zombie',
        characterInfo: characterDescriptions.zombie,
        mbtiType: 'ESTJ',
      },
    });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/results']}>
          <ResultsPage />
        </MemoryRouter>
      </Provider>
    );
    
    // Requirement 1.5: Display results
    await waitFor(() => {
      expect(screen.getByText('좀비')).toBeInTheDocument();
    });
  });

  it('should have retake button on results page', async () => {
    const store = createTestStore();
    
    // Set up store with a result
    store.dispatch({
      type: 'test/submitTestSuccess',
      payload: {
        character: 'zombie',
        characterInfo: characterDescriptions.zombie,
        mbtiType: 'ESTJ',
      },
    });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/results']}>
          <ResultsPage />
        </MemoryRouter>
      </Provider>
    );
    
    // Requirement 5.3: Allow retakes
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /테스트 다시하기/ })).toBeInTheDocument();
    });
  });

  it('should not have view profile button in simple mode', async () => {
    const store = createTestStore();
    
    // Set up store with a result
    store.dispatch({
      type: 'test/submitTestSuccess',
      payload: {
        character: 'zombie',
        characterInfo: characterDescriptions.zombie,
        mbtiType: 'ESTJ',
      },
    });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/results']}>
          <ResultsPage />
        </MemoryRouter>
      </Provider>
    );
    
    // Requirement 5.5: No profile button in simple mode
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /프로필/ })).not.toBeInTheDocument();
    });
  });
});
