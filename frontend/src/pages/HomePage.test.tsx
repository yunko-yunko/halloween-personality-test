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

// Mock feature flags - create inside the factory function
vi.mock('../config/features', () => {
  return {
    features: {
      emailAuth: false,
    },
  };
});

describe('HomePage', () => {
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

  it('renders the main title in Korean', () => {
    renderHomePage();
    expect(screen.getByText('할로윈 성격 테스트')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderHomePage();
    expect(screen.getByText('당신은 어떤 할로윈 캐릭터일까요?')).toBeInTheDocument();
  });

  it('renders the test description', () => {
    renderHomePage();
    expect(screen.getByText(/15개의 질문을 통해 당신의 성격을 분석하고/)).toBeInTheDocument();
    expect(screen.getByText(/8가지 할로윈 캐릭터 중 하나로 매칭해드립니다/)).toBeInTheDocument();
  });

  it('renders all character names', () => {
    renderHomePage();
    expect(screen.getByText(/좀비, 조커, 해골, 수녀, 잭오랜턴, 뱀파이어, 유령, 프랑켄슈타인/)).toBeInTheDocument();
  });

  it('renders the start test button', () => {
    renderHomePage();
    expect(screen.getByRole('button', { name: /테스트 시작하기/ })).toBeInTheDocument();
  });

  it('displays test duration information', () => {
    renderHomePage();
    expect(screen.getByText(/소요 시간: 약 3-5분 \| 총 15개 질문/)).toBeInTheDocument();
  });

  it('navigates to /test when start button is clicked in simple mode', async () => {
    const user = userEvent.setup();
    renderHomePage();
    
    const startButton = screen.getByRole('button', { name: /테스트 시작하기/ });
    await user.click(startButton);
    
    // In simple mode (emailAuth: false), should navigate to /test
    expect(mockNavigate).toHaveBeenCalledWith('/test');
  });

  it('navigates to /test when start button is clicked and not authenticated (simple mode)', async () => {
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
    
    // In simple mode, authentication state doesn't matter
    expect(mockNavigate).toHaveBeenCalledWith('/test');
  });

  it('has responsive design classes', () => {
    const { container } = renderHomePage();
    const mainDiv = container.firstChild;
    
    expect(mainDiv).toHaveClass('min-h-screen');
    expect(mainDiv).toHaveClass('px-4');
  });

  it('applies Halloween theme colors', () => {
    renderHomePage();
    const title = screen.getByText('할로윈 성격 테스트');
    
    expect(title).toHaveClass('text-halloween-orange');
  });
});
