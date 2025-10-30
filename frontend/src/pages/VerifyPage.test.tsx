/**
 * VerifyPage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import VerifyPage from './VerifyPage';
import authReducer from '../store/slices/authSlice';

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    verifyToken: vi.fn(),
  },
}));

// Import after mock
import { authService } from '../services/authService';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('VerifyPage', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['auth/login/fulfilled', 'auth/setUser'],
            ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
            ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt'],
          },
        }),
    });
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  const renderWithRouter = (initialEntries: string[] = ['/auth/verify?token=test-token']) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <VerifyPage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should show loading spinner during verification', () => {
    vi.mocked(authService.verifyToken).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter();

    expect(screen.getByText('인증 중...')).toBeInTheDocument();
    expect(screen.getByText('잠시만 기다려주세요')).toBeInTheDocument();
  });

  it('should extract token from URL query parameter and call verifyToken', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(authService.verifyToken).mockResolvedValue({
      user: mockUser,
      message: 'Success',
    });

    renderWithRouter(['/auth/verify?token=test-token-123']);

    await waitFor(() => {
      expect(authService.verifyToken).toHaveBeenCalledWith('test-token-123');
    });
  });

  it('should update Redux auth state on successful verification', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(authService.verifyToken).mockResolvedValue({
      user: mockUser,
      message: 'Success',
    });

    renderWithRouter();

    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).toEqual(mockUser);
    });
  });

  it('should redirect to /test after successful verification', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(authService.verifyToken).mockResolvedValue({
      user: mockUser,
      message: 'Success',
    });

    renderWithRouter();

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/test', { replace: true });
      },
      { timeout: 2000 }
    );
  });

  it('should display error message for invalid token', async () => {
    vi.mocked(authService.verifyToken).mockRejectedValue({
      response: {
        data: {
          message: '유효하지 않은 토큰입니다.',
        },
      },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('인증 실패')).toBeInTheDocument();
      expect(screen.getByText('유효하지 않은 토큰입니다.')).toBeInTheDocument();
    });
  });

  it('should display error message for expired token', async () => {
    vi.mocked(authService.verifyToken).mockRejectedValue({
      response: {
        data: {
          message: '토큰이 만료되었습니다.',
        },
      },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('인증 실패')).toBeInTheDocument();
      expect(screen.getByText('토큰이 만료되었습니다.')).toBeInTheDocument();
    });
  });

  it('should show resend button on error', async () => {
    vi.mocked(authService.verifyToken).mockRejectedValue({
      response: {
        data: {
          message: '토큰이 만료되었습니다.',
        },
      },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('다시 인증 이메일 받기')).toBeInTheDocument();
    });
  });

  it('should navigate to /auth/email when resend button is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(authService.verifyToken).mockRejectedValue({
      response: {
        data: {
          message: '토큰이 만료되었습니다.',
        },
      },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('다시 인증 이메일 받기')).toBeInTheDocument();
    });

    const resendButton = screen.getByText('다시 인증 이메일 받기');
    await user.click(resendButton);

    expect(mockNavigate).toHaveBeenCalledWith('/auth/email', { replace: true });
  });

  it('should display error when token is missing from URL', async () => {
    renderWithRouter(['/auth/verify']); // No token parameter

    await waitFor(() => {
      expect(screen.getByText('인증 실패')).toBeInTheDocument();
      expect(screen.getByText('인증 토큰이 없습니다.')).toBeInTheDocument();
    });
  });

  it('should display default error message when API error has no message', async () => {
    vi.mocked(authService.verifyToken).mockRejectedValue({
      response: {},
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('인증 실패')).toBeInTheDocument();
      // The thunk returns '인증에 실패했습니다.' as the default message
      expect(screen.getByText('인증에 실패했습니다.')).toBeInTheDocument();
    });
  });
});
