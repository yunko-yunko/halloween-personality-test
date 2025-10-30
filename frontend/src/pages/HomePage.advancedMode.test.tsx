import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import HomePage from './HomePage';
import testReducer from '../store/slices/testSlice';
import authReducer from '../store/slices/authSlice';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock feature flags for ADVANCED MODE
vi.mock('../config/features', () => {
  return {
    features: {
      emailAuth: true, // Advanced mode enabled
    },
  };
});

describe('HomePage - Advanced Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHomePage = (preloadedState = {}) => {
    const store = configureStore({
      reducer: {
        test: testReducer,
        auth: authReducer,
      },
      preloadedState,
    });

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );
  };

  it('navigates to /auth/email when start button is clicked and not authenticated', async () => {
    const user = userEvent.setup();
    renderHomePage({
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      },
    });
    
    const startButton = screen.getByRole('button', { name: /테스트 시작하기/ });
    await user.click(startButton);
    
    // In advanced mode with no authentication, should redirect to email entry
    expect(mockNavigate).toHaveBeenCalledWith('/auth/email');
  });

  it('navigates to /test when start button is clicked and authenticated', async () => {
    const user = userEvent.setup();
    renderHomePage({
      auth: {
        isAuthenticated: true,
        user: {
          id: '123',
          email: 'test@example.com',
          createdAt: '2025-10-13T00:00:00.000Z',
          updatedAt: '2025-10-13T00:00:00.000Z',
        },
        loading: false,
        error: null,
      },
    });
    
    const startButton = screen.getByRole('button', { name: /테스트 시작하기/ });
    await user.click(startButton);
    
    // In advanced mode with authentication, should go directly to test
    expect(mockNavigate).toHaveBeenCalledWith('/test');
  });

  it('renders the same UI elements as simple mode', () => {
    renderHomePage();
    
    // Verify all main elements are still present
    expect(screen.getByText('할로윈 성격 테스트')).toBeInTheDocument();
    expect(screen.getByText('당신은 어떤 할로윈 캐릭터일까요?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /테스트 시작하기/ })).toBeInTheDocument();
  });
});
