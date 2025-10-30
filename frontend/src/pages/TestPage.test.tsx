import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import TestPage from './TestPage';
import testReducer from '../store/slices/testSlice';
import authReducer from '../store/slices/authSlice';
import { testService } from '../services/testService';
import type { Question } from '../types';

// Mock the test service
vi.mock('../services/testService', () => ({
  testService: {
    getQuestions: vi.fn(),
    submitTest: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Sample questions for testing
const mockQuestions: Question[] = [
  // Page 1 questions (EI dimension)
  {
    id: 'ei_1',
    text: '주말에 에너지를 충전하는 방법은?',
    dimension: 'EI',
    answers: [
      { id: 'ei_1_a', text: '친구들과 만나서 활동적으로 보낸다', value: 'E' },
      { id: 'ei_1_b', text: '집에서 혼자 조용히 쉰다', value: 'I' },
    ],
  },
  {
    id: 'ei_2',
    text: '새로운 사람들을 만날 때?',
    dimension: 'EI',
    answers: [
      { id: 'ei_2_a', text: '먼저 다가가서 대화를 시작한다', value: 'E' },
      { id: 'ei_2_b', text: '상대방이 먼저 말을 걸기를 기다린다', value: 'I' },
    ],
  },
  {
    id: 'ei_3',
    text: '파티에서 나는?',
    dimension: 'EI',
    answers: [
      { id: 'ei_3_a', text: '여러 사람과 이야기하며 즐긴다', value: 'E' },
      { id: 'ei_3_b', text: '친한 친구 몇 명과만 깊은 대화를 나눈다', value: 'I' },
    ],
  },
  {
    id: 'ei_4',
    text: '스트레스를 받을 때?',
    dimension: 'EI',
    answers: [
      { id: 'ei_4_a', text: '친구들과 만나서 이야기한다', value: 'E' },
      { id: 'ei_4_b', text: '혼자만의 시간을 갖는다', value: 'I' },
    ],
  },
  {
    id: 'ei_5',
    text: '전화 통화는?',
    dimension: 'EI',
    answers: [
      { id: 'ei_5_a', text: '길게 이야기하는 것이 좋다', value: 'E' },
      { id: 'ei_5_b', text: '필요한 말만 간단히 한다', value: 'I' },
    ],
  },
  // Page 2 questions (NS dimension)
  {
    id: 'ns_1',
    text: '문제를 해결할 때?',
    dimension: 'NS',
    answers: [
      { id: 'ns_1_a', text: '새로운 방법을 시도한다', value: 'N' },
      { id: 'ns_1_b', text: '검증된 방법을 따른다', value: 'S' },
    ],
  },
  {
    id: 'ns_2',
    text: '이야기를 할 때?',
    dimension: 'NS',
    answers: [
      { id: 'ns_2_a', text: '큰 그림과 의미를 중시한다', value: 'N' },
      { id: 'ns_2_b', text: '구체적인 사실과 세부사항을 중시한다', value: 'S' },
    ],
  },
  {
    id: 'ns_3',
    text: '새로운 것을 배울 때?',
    dimension: 'NS',
    answers: [
      { id: 'ns_3_a', text: '이론과 개념부터 이해한다', value: 'N' },
      { id: 'ns_3_b', text: '실제로 해보면서 배운다', value: 'S' },
    ],
  },
  {
    id: 'ns_4',
    text: '미래에 대해?',
    dimension: 'NS',
    answers: [
      { id: 'ns_4_a', text: '가능성과 잠재력을 본다', value: 'N' },
      { id: 'ns_4_b', text: '현실적인 계획을 세운다', value: 'S' },
    ],
  },
  {
    id: 'ns_5',
    text: '책을 읽을 때?',
    dimension: 'NS',
    answers: [
      { id: 'ns_5_a', text: '상상력을 자극하는 내용이 좋다', value: 'N' },
      { id: 'ns_5_b', text: '실용적인 정보가 담긴 내용이 좋다', value: 'S' },
    ],
  },
  // Page 3 questions (TF dimension)
  {
    id: 'tf_1',
    text: '결정을 내릴 때?',
    dimension: 'TF',
    answers: [
      { id: 'tf_1_a', text: '논리와 분석을 중시한다', value: 'T' },
      { id: 'tf_1_b', text: '감정과 가치를 중시한다', value: 'F' },
    ],
  },
  {
    id: 'tf_2',
    text: '친구가 고민을 털어놓을 때?',
    dimension: 'TF',
    answers: [
      { id: 'tf_2_a', text: '해결책을 제시한다', value: 'T' },
      { id: 'tf_2_b', text: '공감하고 위로한다', value: 'F' },
    ],
  },
  {
    id: 'tf_3',
    text: '비판을 받을 때?',
    dimension: 'TF',
    answers: [
      { id: 'tf_3_a', text: '객관적으로 받아들인다', value: 'T' },
      { id: 'tf_3_b', text: '감정적으로 상처받는다', value: 'F' },
    ],
  },
  {
    id: 'tf_4',
    text: '중요한 것은?',
    dimension: 'TF',
    answers: [
      { id: 'tf_4_a', text: '정의와 공정성', value: 'T' },
      { id: 'tf_4_b', text: '조화와 배려', value: 'F' },
    ],
  },
  {
    id: 'tf_5',
    text: '갈등 상황에서?',
    dimension: 'TF',
    answers: [
      { id: 'tf_5_a', text: '원칙을 지키는 것이 중요하다', value: 'T' },
      { id: 'tf_5_b', text: '관계를 유지하는 것이 중요하다', value: 'F' },
    ],
  },
];

describe('TestPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        test: testReducer,
        auth: authReducer,
      },
    });

    // Mock successful API response
    vi.mocked(testService.getQuestions).mockResolvedValue({
      questions: mockQuestions,
    });
  });

  const renderTestPage = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <TestPage />
        </BrowserRouter>
      </Provider>
    );
  };

  it('loads questions from API on mount', async () => {
    renderTestPage();

    await waitFor(() => {
      expect(testService.getQuestions).toHaveBeenCalledTimes(1);
    });

    // Should display first page questions
    await waitFor(() => {
      expect(screen.getByText('주말에 에너지를 충전하는 방법은?')).toBeInTheDocument();
    });
  });

  it('displays 5 questions per page', async () => {
    renderTestPage();

    await waitFor(() => {
      expect(screen.getByText('주말에 에너지를 충전하는 방법은?')).toBeInTheDocument();
    });

    // Count TestQuestion components (each has 2 answer buttons)
    const answerButtons = screen.getAllByRole('button', { name: /선택됨|친구들|집에서|먼저|상대방|여러|친한|친구들과|혼자만|길게|필요한/ });
    // 5 questions × 2 answers = 10 buttons (plus navigation buttons)
    expect(answerButtons.length).toBeGreaterThanOrEqual(10);
  });

  it('shows ProgressIndicator at top', async () => {
    renderTestPage();

    await waitFor(() => {
      expect(screen.getByText('주말에 에너지를 충전하는 방법은?')).toBeInTheDocument();
    });

    // Check for progress bar
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '3');
  });

  it('implements Next button on pages 1-2', async () => {
    renderTestPage();

    await waitFor(() => {
      expect(screen.getByText('주말에 에너지를 충전하는 방법은?')).toBeInTheDocument();
    });

    // Next button should be present but disabled initially
    const nextButton = screen.getByRole('button', { name: /다음/ });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });

  it('implements Previous button on pages 2-3', async () => {
    renderTestPage();

    await waitFor(() => {
      expect(screen.getByText('주말에 에너지를 충전하는 방법은?')).toBeInTheDocument();
    });

    // Answer all questions on page 1
    const firstAnswerButtons = screen.getAllByRole('button');
    for (let i = 0; i < 10; i += 2) {
      if (firstAnswerButtons[i].textContent?.includes('친구들') || 
          firstAnswerButtons[i].textContent?.includes('먼저') ||
          firstAnswerButtons[i].textContent?.includes('여러') ||
          firstAnswerButtons[i].textContent?.includes('친구들과') ||
          firstAnswerButtons[i].textContent?.includes('길게')) {
        fireEvent.click(firstAnswerButtons[i]);
      }
    }

    // Click Next
    const nextButton = screen.getByRole('button', { name: /다음/ });
    fireEvent.click(nextButton);

    // Previous button should now be visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /이전/ })).toBeInTheDocument();
    });
  });

  it('validates all questions answered before allowing navigation', async () => {
    renderTestPage();

    await waitFor(() => {
      expect(screen.getByText('주말에 에너지를 충전하는 방법은?')).toBeInTheDocument();
    });

    // Try to click Next without answering
    const nextButton = screen.getByRole('button', { name: /다음/ });
    expect(nextButton).toBeDisabled();

    // Answer one question
    const firstAnswer = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('친구들과 만나서')
    );
    if (firstAnswer) fireEvent.click(firstAnswer);

    // Next should still be disabled
    expect(nextButton).toBeDisabled();
  });

  it('preserves answers when navigating between pages', async () => {
    renderTestPage();

    await waitFor(() => {
      expect(screen.getByText('주말에 에너지를 충전하는 방법은?')).toBeInTheDocument();
    });

    // Answer all 5 questions on page 1 by clicking the first answer of each question
    const allButtons = screen.getAllByRole('button');
    const answerButtons = allButtons.filter(btn => 
      btn.getAttribute('aria-label')?.includes('친구들과 만나서') ||
      btn.getAttribute('aria-label')?.includes('먼저 다가가서') ||
      btn.getAttribute('aria-label')?.includes('여러 사람과') ||
      btn.getAttribute('aria-label')?.includes('친구들과 만나서') ||
      btn.getAttribute('aria-label')?.includes('길게 이야기')
    );

    // Click first answer for each of the 5 questions
    const questionsToAnswer = [
      '친구들과 만나서 활동적으로 보낸다',
      '먼저 다가가서 대화를 시작한다',
      '여러 사람과 이야기하며 즐긴다',
      '친구들과 만나서 이야기한다',
      '길게 이야기하는 것이 좋다'
    ];

    for (const answerText of questionsToAnswer) {
      const button = allButtons.find(btn => btn.textContent?.includes(answerText));
      if (button) {
        fireEvent.click(button);
      }
    }

    // Wait for Next button to be enabled
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /다음/ });
      expect(nextButton).not.toBeDisabled();
    });

    // Go to next page
    const nextButton = screen.getByRole('button', { name: /다음/ });
    fireEvent.click(nextButton);

    // Wait for page 2 to load
    await waitFor(() => {
      expect(screen.getByText('문제를 해결할 때?')).toBeInTheDocument();
    });

    // Go back to previous page
    const prevButton = screen.getByRole('button', { name: /이전/ });
    fireEvent.click(prevButton);

    // Wait for page 1 to load again
    await waitFor(() => {
      expect(screen.getByText('주말에 에너지를 충전하는 방법은?')).toBeInTheDocument();
    });

    // Check if first answer is still selected (should have checkmark)
    await waitFor(() => {
      const selectedButtons = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('✓')
      );
      expect(selectedButtons.length).toBeGreaterThan(0);
    });
  });
});
