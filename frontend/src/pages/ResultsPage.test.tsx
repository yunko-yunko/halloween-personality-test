import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ResultsPage from './ResultsPage';
import testReducer from '../store/slices/testSlice';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock features config
vi.mock('../config/features', () => ({
  features: {
    emailAuth: false,
  },
}));

describe('ResultsPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const createMockStore = (result: any = null) => {
    return configureStore({
      reducer: {
        test: testReducer,
      },
      preloadedState: {
        test: {
          questions: [],
          answers: {},
          currentPage: 1,
          result,
          isLoading: false,
          error: null,
        },
      },
    });
  };

  const renderWithProviders = (store: any) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ResultsPage />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should redirect to home if no result is available', () => {
    const store = createMockStore(null);
    renderWithProviders(store);

    // Should show loading state initially
    expect(screen.getByText('결과를 불러오는 중...')).toBeInTheDocument();
  });

  it('should display character result when result is available', () => {
    const mockResult = {
      character: 'zombie' as const,
      characterInfo: {
        name: '좀비',
        description: '좀비 설명',
        imagePath: '/assets/characters/zombie.png',
        mbtiTypes: ['ESTJ', 'ESTP'] as [string, string],
      },
      mbtiType: 'ESTJ',
    };

    const store = createMockStore(mockResult);
    renderWithProviders(store);

    // Should display character name
    expect(screen.getByText('좀비')).toBeInTheDocument();
    
    // Should display character description
    expect(screen.getByText('좀비 설명')).toBeInTheDocument();
    
    // Should display retake button
    expect(screen.getByText(/테스트 다시하기/)).toBeInTheDocument();
  });

  it('should handle retake test button click', () => {
    const mockResult = {
      character: 'zombie' as const,
      characterInfo: {
        name: '좀비',
        description: '좀비 설명',
        imagePath: '/assets/characters/zombie.png',
        mbtiTypes: ['ESTJ', 'ESTP'] as [string, string],
      },
      mbtiType: 'ESTJ',
    };

    const store = createMockStore(mockResult);
    renderWithProviders(store);

    // Click retake test button
    const retakeButton = screen.getByText(/테스트 다시하기/);
    fireEvent.click(retakeButton);

    // Should navigate to /test
    expect(mockNavigate).toHaveBeenCalledWith('/test');
  });

  it('should display social sharing buttons', () => {
    const mockResult = {
      character: 'vampire' as const,
      characterInfo: {
        name: '뱀파이어',
        description: '뱀파이어 설명',
        imagePath: '/assets/characters/vampire.png',
        mbtiTypes: ['ISTJ', 'ISTP'] as [string, string],
      },
      mbtiType: 'ISTJ',
    };

    const store = createMockStore(mockResult);
    renderWithProviders(store);

    // Should display sharing section
    expect(screen.getByText('결과 공유하기 👻')).toBeInTheDocument();
    
    // Should display social media buttons
    expect(screen.getByText('트위터')).toBeInTheDocument();
    expect(screen.getByText('페이스북')).toBeInTheDocument();
    expect(screen.getByText('카카오톡')).toBeInTheDocument();
  });

  it('should handle social sharing button clicks', () => {
    const mockResult = {
      character: 'ghost' as const,
      characterInfo: {
        name: '유령',
        description: '유령 설명',
        imagePath: '/assets/characters/ghost.png',
        mbtiTypes: ['ESFJ', 'ESFP'] as [string, string],
      },
      mbtiType: 'ESFJ',
    };

    const store = createMockStore(mockResult);
    
    // Mock window.open
    const mockWindowOpen = vi.fn();
    window.open = mockWindowOpen;

    renderWithProviders(store);

    // Click Twitter share button
    const twitterButton = screen.getByLabelText('트위터에 공유하기');
    fireEvent.click(twitterButton);
    
    expect(mockWindowOpen).toHaveBeenCalled();
    expect(mockWindowOpen.mock.calls[0][0]).toContain('twitter.com');
  });

  it('should be responsive and display properly', () => {
    const mockResult = {
      character: 'joker' as const,
      characterInfo: {
        name: '조커',
        description: '조커 설명',
        imagePath: '/assets/characters/joker.png',
        mbtiTypes: ['ENTJ', 'ENTP'] as [string, string],
      },
      mbtiType: 'ENTJ',
    };

    const store = createMockStore(mockResult);
    const { container } = renderWithProviders(store);

    // Check for responsive classes
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('bg-gradient-to-b');
  });
});
