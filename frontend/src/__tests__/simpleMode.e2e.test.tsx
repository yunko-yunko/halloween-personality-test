/**
 * End-to-End Tests for Simple Mode
 * 
 * Tests the complete user flow in simple mode (ENABLE_EMAIL_AUTH=false):
 * - Landing page → Test (3 pages) → Results
 * - All 8 character mappings
 * - Responsive design (mobile, tablet, desktop)
 * - No data persistence
 * - Unlimited retakes
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../App';
import testReducer from '../store/slices/testSlice';
import authReducer from '../store/slices/authSlice';
import questions from '../data/questions.json';
import characterDescriptions from '../data/character-descriptions.json';
import type { HalloweenCharacter, DimensionValue } from '../types';

// Import after mocks
import { testService } from '../services/testService';

// Mock the feature flag to ensure simple mode
vi.mock('../config/features', () => ({
  features: {
    emailAuth: false,
  },
}));

// Mock testService at module level
vi.mock('../services/testService', () => ({
  testService: {
    getQuestions: vi.fn(),
    submitTest: vi.fn(),
  },
}));

// Helper to create a fresh store for each test
function createTestStore() {
  return configureStore({
    reducer: {
      test: testReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'auth/login/fulfilled',
            'auth/checkAuth/fulfilled',
            'auth/setUser',
          ],
          ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
          ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt'],
        },
      }),
  });
}

// Helper to render the app with providers
function renderApp() {
  const store = createTestStore();
  const user = userEvent.setup();
  
  const utils = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  
  return { ...utils, user, store };
}

// Helper to answer questions with specific pattern
async function answerQuestionsWithPattern(
  user: ReturnType<typeof userEvent.setup>,
  pattern: Record<string, DimensionValue>
) {
  const { questions: allQuestions } = questions;
  
  // Page 1: Questions 1-5 (EI dimension)
  for (let i = 0; i < 5; i++) {
    const question = allQuestions[i];
    const targetValue = pattern[question.dimension];
    const answer = question.answers.find(a => a.value === targetValue);
    
    if (answer) {
      const button = screen.getByRole('button', { name: new RegExp(answer.text) });
      await user.click(button);
    }
  }
  
  // Click Next to page 2
  const nextButton1 = screen.getByRole('button', { name: /다음/i });
  await user.click(nextButton1);
  
  // Page 2: Questions 6-10 (NS dimension)
  await waitFor(() => {
    expect(screen.getByText(/2\/3/)).toBeInTheDocument();
  });
  
  for (let i = 5; i < 10; i++) {
    const question = allQuestions[i];
    const targetValue = pattern[question.dimension];
    const answer = question.answers.find(a => a.value === targetValue);
    
    if (answer) {
      const button = screen.getByRole('button', { name: new RegExp(answer.text) });
      await user.click(button);
    }
  }
  
  // Click Next to page 3
  const nextButton2 = screen.getByRole('button', { name: /다음/i });
  await user.click(nextButton2);
  
  // Page 3: Questions 11-15 (TF dimension)
  await waitFor(() => {
    expect(screen.getByText(/3\/3/)).toBeInTheDocument();
  });
  
  for (let i = 10; i < 15; i++) {
    const question = allQuestions[i];
    const targetValue = pattern[question.dimension];
    const answer = question.answers.find(a => a.value === targetValue);
    
    if (answer) {
      const button = screen.getByRole('button', { name: new RegExp(answer.text) });
      await user.click(button);
    }
  }
  
  // Submit test
  const submitButton = screen.getByRole('button', { name: /제출/i });
  await user.click(submitButton);
}

describe('Simple Mode E2E Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    sessionStorage.clear();
    
    // Setup mocks for each test
    vi.mocked(testService.getQuestions).mockResolvedValue({
      questions: questions.questions,
    });
    
    vi.mocked(testService.submitTest).mockImplementation(async (answers) => {
      // Calculate MBTI based on answers
      const dimensions = { EI: '', NS: '', TF: '' };
      
      for (const dim of ['EI', 'NS', 'TF'] as const) {
        const dimAnswers = answers.filter(a => {
          const q = questions.questions.find(q => q.id === a.questionId);
          return q?.dimension === dim;
        });
        
        const counts: Record<string, number> = {};
        dimAnswers.forEach(a => {
          counts[a.value] = (counts[a.value] || 0) + 1;
        });
        
        const [first, second] = dim.split('');
        dimensions[dim] = (counts[first] || 0) >= (counts[second] || 0) ? first : second;
      }
      
      const mbtiType = dimensions.EI + dimensions.NS + dimensions.TF + 'J';
      
      // Map to character
      const characterMap: Record<string, HalloweenCharacter> = {
        'ESTJ': 'zombie', 'ESTP': 'zombie',
        'ENTJ': 'joker', 'ENTP': 'joker',
        'INFJ': 'skeleton', 'INFP': 'skeleton',
        'ISFJ': 'nun', 'ISFP': 'nun',
        'ENFJ': 'jack-o-lantern', 'ENFP': 'jack-o-lantern',
        'ISTJ': 'vampire', 'ISTP': 'vampire',
        'ESFJ': 'ghost', 'ESFP': 'ghost',
        'INTJ': 'frankenstein', 'INTP': 'frankenstein',
      };
      
      const character = characterMap[mbtiType] || 'zombie';
      const characterInfo = characterDescriptions[character];
      
      return {
        character,
        characterInfo,
        mbtiType,
      };
    });
  });

  describe('Complete User Flow', () => {
    it('should complete the full test flow from landing to results', async () => {
      const { user } = renderApp();
      
      // Requirement 5.1: Landing page should be accessible without authentication
      expect(screen.getByText(/할로윈 성격 테스트/)).toBeInTheDocument();
      
      // Start test
      const startButton = screen.getByRole('button', { name: /테스트 시작하기/ });
      await user.click(startButton);
      
      // Requirement 1.1: Should present 15 questions divided into 3 pages
      await waitFor(() => {
        expect(screen.getByText(/1\/3/)).toBeInTheDocument();
      });
      
      // Answer all questions with E, N, T pattern (should result in ENTJ -> Joker)
      await answerQuestionsWithPattern(user, { EI: 'E', NS: 'N', TF: 'T' });
      
      // Requirement 1.5: Should display results
      await waitFor(() => {
        expect(screen.getByText(/조커/)).toBeInTheDocument();
      });
      
      // Requirement 5.2: Results should be displayed immediately
      const characterDescription = characterDescriptions.joker.description;
      expect(screen.getByText(new RegExp(characterDescription))).toBeInTheDocument();
    });

    it('should allow navigation between test pages', async () => {
      const { user } = renderApp();
      
      // Start test
      const startButton = screen.getByRole('button', { name: /테스트 시작하기/ });
      await user.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText(/1\/3/)).toBeInTheDocument();
      });
      
      // Answer page 1 questions
      const firstQuestion = questions.questions[0];
      const firstAnswer = screen.getByRole('button', { 
        name: new RegExp(firstQuestion.answers[0].text) 
      });
      await user.click(firstAnswer);
      
      // Answer remaining questions on page 1
      for (let i = 1; i < 5; i++) {
        const q = questions.questions[i];
        const btn = screen.getByRole('button', { name: new RegExp(q.answers[0].text) });
        await user.click(btn);
      }
      
      // Requirement 2.2: Next button should be available
      const nextButton = screen.getByRole('button', { name: /다음/i });
      await user.click(nextButton);
      
      // Should be on page 2
      await waitFor(() => {
        expect(screen.getByText(/2\/3/)).toBeInTheDocument();
      });
      
      // Requirement 2.3: Previous button should be available
      const prevButton = screen.getByRole('button', { name: /이전/i });
      expect(prevButton).toBeInTheDocument();
      
      // Go back to page 1
      await user.click(prevButton);
      
      // Requirement 2.5: Should preserve answers
      await waitFor(() => {
        expect(screen.getByText(/1\/3/)).toBeInTheDocument();
      });
      
      // First answer should still be selected (check for aria-pressed attribute)
      const selectedButton = screen.getByRole('button', { 
        name: new RegExp(firstQuestion.answers[0].text) 
      });
      expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Character Mapping Tests', () => {
    const characterTests: Array<{
      name: string;
      pattern: Record<string, DimensionValue>;
      expectedCharacter: HalloweenCharacter;
      expectedName: string;
    }> = [
      {
        name: 'ESTJ/ESTP -> Zombie',
        pattern: { EI: 'E', NS: 'S', TF: 'T' },
        expectedCharacter: 'zombie',
        expectedName: '좀비',
      },
      {
        name: 'ENTJ/ENTP -> Joker',
        pattern: { EI: 'E', NS: 'N', TF: 'T' },
        expectedCharacter: 'joker',
        expectedName: '조커',
      },
      {
        name: 'INFJ/INFP -> Skeleton',
        pattern: { EI: 'I', NS: 'N', TF: 'F' },
        expectedCharacter: 'skeleton',
        expectedName: '해골',
      },
      {
        name: 'ISFJ/ISFP -> Nun',
        pattern: { EI: 'I', NS: 'S', TF: 'F' },
        expectedCharacter: 'nun',
        expectedName: '수녀',
      },
      {
        name: 'ENFJ/ENFP -> Jack-o-lantern',
        pattern: { EI: 'E', NS: 'N', TF: 'F' },
        expectedCharacter: 'jack-o-lantern',
        expectedName: '잭오랜턴',
      },
      {
        name: 'ISTJ/ISTP -> Vampire',
        pattern: { EI: 'I', NS: 'S', TF: 'T' },
        expectedCharacter: 'vampire',
        expectedName: '뱀파이어',
      },
      {
        name: 'ESFJ/ESFP -> Ghost',
        pattern: { EI: 'E', NS: 'S', TF: 'F' },
        expectedCharacter: 'ghost',
        expectedName: '유령',
      },
      {
        name: 'INTJ/INTP -> Frankenstein',
        pattern: { EI: 'I', NS: 'N', TF: 'T' },
        expectedCharacter: 'frankenstein',
        expectedName: '프랑켄슈타인',
      },
    ];

    characterTests.forEach(({ name, pattern, expectedCharacter, expectedName }) => {
      it(`should correctly map ${name}`, async () => {
        const { user } = renderApp();
        
        // Start test
        const startButton = screen.getByRole('button', { name: /테스트 시작/i });
        await user.click(startButton);
        
        await waitFor(() => {
          expect(screen.getByText(/1\/3/)).toBeInTheDocument();
        });
        
        // Answer questions with the specific pattern
        await answerQuestionsWithPattern(user, pattern);
        
        // Requirement 3.x: Verify correct character mapping
        await waitFor(() => {
          expect(screen.getByText(expectedName)).toBeInTheDocument();
        });
        
        // Verify character description is shown
        const characterInfo = characterDescriptions[expectedCharacter];
        expect(screen.getByText(new RegExp(characterInfo.description))).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design Tests', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];

    viewports.forEach(({ name, width, height }) => {
      it(`should render correctly on ${name} viewport`, async () => {
        // Set viewport size
        global.innerWidth = width;
        global.innerHeight = height;
        window.dispatchEvent(new Event('resize'));
        
        const { user } = renderApp();
        
        // Requirement 16.1-16.3: Should adapt to different screen sizes
        expect(screen.getByText(/할로윈 성격 테스트/i)).toBeInTheDocument();
        
        // Start test
        const startButton = screen.getByRole('button', { name: /테스트 시작/i });
        await user.click(startButton);
        
        await waitFor(() => {
          expect(screen.getByText(/1\/3/)).toBeInTheDocument();
        });
        
        // Verify questions are displayed
        const firstQuestion = questions.questions[0];
        expect(screen.getByText(firstQuestion.text)).toBeInTheDocument();
        
        // Requirement 16.4: Touch targets should be appropriately sized
        const answerButtons = screen.getAllByRole('button', { 
          name: new RegExp(firstQuestion.answers[0].text) 
        });
        expect(answerButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Persistence Tests', () => {
    it('should not persist results after browser close (simulated)', async () => {
      const { user, store } = renderApp();
      
      // Complete test
      const startButton = screen.getByRole('button', { name: /테스트 시작/i });
      await user.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText(/1\/3/)).toBeInTheDocument();
      });
      
      await answerQuestionsWithPattern(user, { EI: 'E', NS: 'N', TF: 'T' });
      
      await waitFor(() => {
        expect(screen.getByText(/조커/)).toBeInTheDocument();
      });
      
      // Requirement 5.4: Results should be lost on browser close
      // Simulate by checking that no localStorage or sessionStorage is used
      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
      
      // Verify store state is only in memory
      const state = store.getState();
      expect(state.test.result).toBeTruthy();
      
      // Simulate browser close by creating new app instance
      const { store: newStore } = renderApp();
      const newState = newStore.getState();
      
      // New instance should have no results
      expect(newState.test.result).toBeNull();
    });

    it('should not show profile or history UI elements in simple mode', () => {
      renderApp();
      
      // Requirement 5.5: Should not display profile, login, or history-related UI
      expect(screen.queryByText(/프로필/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/로그인/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/히스토리/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/이메일/i)).not.toBeInTheDocument();
    });
  });

  describe('Unlimited Retakes Tests', () => {
    it('should allow unlimited retakes without storing history', async () => {
      const { user } = renderApp();
      
      // First test
      const startButton = screen.getByRole('button', { name: /테스트 시작/i });
      await user.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText(/1\/3/)).toBeInTheDocument();
      });
      
      await answerQuestionsWithPattern(user, { EI: 'E', NS: 'N', TF: 'T' });
      
      await waitFor(() => {
        expect(screen.getByText(/조커/)).toBeInTheDocument();
      });
      
      // Requirement 5.3: Should allow retake
      const retakeButton = screen.getByRole('button', { name: /다시 하기/i });
      await user.click(retakeButton);
      
      // Should be back at test page
      await waitFor(() => {
        expect(screen.getByText(/1\/3/)).toBeInTheDocument();
      });
      
      // Second test with different answers
      await answerQuestionsWithPattern(user, { EI: 'I', NS: 'S', TF: 'F' });
      
      await waitFor(() => {
        expect(screen.getByText(/수녀/)).toBeInTheDocument();
      });
      
      // Should show new result, not history
      expect(screen.queryByText(/조커/)).not.toBeInTheDocument();
      
      // Third retake
      const retakeButton2 = screen.getByRole('button', { name: /다시 하기/i });
      await user.click(retakeButton2);
      
      await waitFor(() => {
        expect(screen.getByText(/1\/3/)).toBeInTheDocument();
      });
      
      // Verify no history is stored
      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API failure
      vi.spyOn(testService, 'getQuestions').mockRejectedValue(
        new Error('Network error')
      );
      
      const { user } = renderApp();
      
      const startButton = screen.getByRole('button', { name: /테스트 시작/i });
      await user.click(startButton);
      
      // Should show error message in Korean
      await waitFor(() => {
        expect(screen.getByText(/오류가 발생했습니다/i)).toBeInTheDocument();
      });
    });

    it('should prevent submission with incomplete answers', async () => {
      const { user } = renderApp();
      
      const startButton = screen.getByRole('button', { name: /테스트 시작/i });
      await user.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText(/1\/3/)).toBeInTheDocument();
      });
      
      // Answer only 3 out of 5 questions
      for (let i = 0; i < 3; i++) {
        const q = questions.questions[i];
        const btn = screen.getByRole('button', { name: new RegExp(q.answers[0].text) });
        await user.click(btn);
      }
      
      // Try to click Next
      const nextButton = screen.getByRole('button', { name: /다음/i });
      await user.click(nextButton);
      
      // Requirement 17.2: Should display validation error
      await waitFor(() => {
        expect(screen.getByText(/모든 질문에 답변해주세요/i)).toBeInTheDocument();
      });
      
      // Should still be on page 1
      expect(screen.getByText(/1\/3/)).toBeInTheDocument();
    });
  });
});
