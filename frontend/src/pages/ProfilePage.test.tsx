import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProfilePage from './ProfilePage';
import { authService } from '../services/authService';
import authReducer from '../store/slices/authSlice';
import testReducer from '../store/slices/testSlice';
import type { TestResult, User } from '../types';

// Mock the authService
vi.mock('../services/authService', () => ({
  authService: {
    getHistory: vi.fn(),
    getProfile: vi.fn(),
    logout: vi.fn(),
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

describe('ProfilePage', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTestResults: TestResult[] = [
    {
      id: 'result-1',
      userId: 'user-123',
      characterType: 'zombie',
      mbtiType: 'ESTJ',
      completedAt: new Date('2024-10-31T12:00:00'),
    },
    {
      id: 'result-2',
      userId: 'user-123',
      characterType: 'vampire',
      mbtiType: 'ISTJ',
      completedAt: new Date('2024-10-30T10:00:00'),
    },
  ];

  const createMockStore = (user: User | null = mockUser) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        test: testReducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: !!user,
          user,
          loading: false,
          error: null,
        },
        test: {
          questions: [],
          answers: {},
          currentPage: 1,
          result: null,
          loading: false,
          error: null,
        },
      },
    });
  };

  const renderWithProviders = (user: User | null = mockUser) => {
    const store = createMockStore(user);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ProfilePage />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(authService.getHistory).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders();

    expect(screen.getByText('프로필을 불러오는 중...')).toBeInTheDocument();
  });

  it('displays user information', async () => {
    vi.mocked(authService.getHistory).mockResolvedValue({
      results: mockTestResults,
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('displays test history when available', async () => {
    vi.mocked(authService.getHistory).mockResolvedValue({
      results: mockTestResults,
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('좀비')).toBeInTheDocument();
      expect(screen.getByText('뱀파이어')).toBeInTheDocument();
    });
  });

  it('displays empty state when no test history', async () => {
    vi.mocked(authService.getHistory).mockResolvedValue({
      results: [],
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('아직 테스트 기록이 없습니다')).toBeInTheDocument();
    });
  });

  it('handles logout button click', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.getHistory).mockResolvedValue({
      results: [],
    });
    vi.mocked(authService.logout).mockResolvedValue({
      message: 'Logged out successfully',
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('로그아웃');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles take new test button click', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.getHistory).mockResolvedValue({
      results: [],
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('새 테스트 하기 🎃')).toBeInTheDocument();
    });

    const newTestButton = screen.getByText('새 테스트 하기 🎃');
    await user.click(newTestButton);

    expect(mockNavigate).toHaveBeenCalledWith('/test');
  });

  it('displays error state when API call fails', async () => {
    vi.mocked(authService.getHistory).mockRejectedValue({
      message: '서버 오류가 발생했습니다.',
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('서버 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    vi.mocked(authService.getHistory).mockResolvedValue({
      results: mockTestResults,
    });

    renderWithProviders();

    await waitFor(() => {
      // Check that dates are formatted in Korean (multiple instances expected)
      const dateElements = screen.getAllByText(/2024년/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('displays character descriptions for each result', async () => {
    vi.mocked(authService.getHistory).mockResolvedValue({
      results: mockTestResults,
    });

    renderWithProviders();

    await waitFor(() => {
      // Check that character descriptions are displayed
      expect(
        screen.getByText(/현실적이고 실용적인 좀비/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/신중하고 분석적인 뱀파이어/)
      ).toBeInTheDocument();
    });
  });

  it('handles logout failure gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.getHistory).mockResolvedValue({
      results: [],
    });
    vi.mocked(authService.logout).mockRejectedValue(
      new Error('Logout failed')
    );

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('로그아웃');
    await user.click(logoutButton);

    // Should still navigate even if logout fails
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('renders responsive layout', async () => {
    vi.mocked(authService.getHistory).mockResolvedValue({
      results: mockTestResults,
    });

    const { container } = renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('좀비')).toBeInTheDocument();
    });

    // Check for responsive grid classes
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });
});
