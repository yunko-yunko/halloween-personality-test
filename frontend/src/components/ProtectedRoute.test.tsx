import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import testReducer from '../store/slices/testSlice';
import authReducer from '../store/slices/authSlice';

// Mock the features config module
const mockFeatures = { emailAuth: false };
vi.mock('../config/features', () => ({
  features: mockFeatures,
}));

// Helper to create a test store
const createTestStore = (authState = {}, testState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      test: testReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        ...authState,
      },
      test: {
        questions: [],
        answers: {},
        currentPage: 1,
        result: null,
        loading: false,
        error: null,
        ...testState,
      },
    },
  });
};

// Helper to render with router and store
const renderWithProviders = (
  ui: React.ReactElement,
  { store = createTestStore(), route = '/' } = {}
) => {
  window.history.pushState({}, 'Test page', route);
  
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  // Import ProtectedRoute after mocking
  let ProtectedRoute: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-import to get fresh module with current mock
    const module = await import('./ProtectedRoute');
    ProtectedRoute = module.ProtectedRoute;
  });

  afterEach(() => {
    // Reset to default
    mockFeatures.emailAuth = false;
  });

  describe('Simple Mode (emailAuth disabled)', () => {
    beforeEach(() => {
      mockFeatures.emailAuth = false;
    });

    it('should render children when feature flag is disabled', () => {
      const store = createTestStore();
      
      renderWithProviders(
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        { store }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to /test when requireTestCompletion is true and no result', () => {
      const store = createTestStore({}, { result: null });
      
      renderWithProviders(
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/test" element={<div>Test Page</div>} />
          <Route
            path="/results"
            element={
              <ProtectedRoute requireTestCompletion>
                <div>Results</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        { store, route: '/results' }
      );

      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('should render children when requireTestCompletion is true and result exists', () => {
      const store = createTestStore({}, { 
        result: {
          character: 'zombie',
          mbtiType: 'ESTJ',
          description: 'Test description',
        }
      });
      
      renderWithProviders(
        <Routes>
          <Route
            path="/results"
            element={
              <ProtectedRoute requireTestCompletion>
                <div>Results Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        { store, route: '/results' }
      );

      expect(screen.getByText('Results Content')).toBeInTheDocument();
    });
  });

  describe('Advanced Mode (emailAuth enabled)', () => {
    beforeEach(() => {
      mockFeatures.emailAuth = true;
    });

    it('should show loading spinner when auth is loading', () => {
      const store = createTestStore({ loading: true });
      
      renderWithProviders(
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requireAuth={true}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        { store }
      );

      // LoadingSpinner should be rendered
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect to /auth/email when not authenticated', () => {
      const store = createTestStore({ isAuthenticated: false });
      
      renderWithProviders(
        <Routes>
          <Route path="/auth/email" element={<div>Email Entry</div>} />
          <Route
            path="/test"
            element={
              <ProtectedRoute requireAuth={true}>
                <div>Test Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        { store, route: '/test' }
      );

      expect(screen.getByText('Email Entry')).toBeInTheDocument();
    });

    it('should render children when authenticated', () => {
      const store = createTestStore({ 
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() }
      });
      
      renderWithProviders(
        <Routes>
          <Route
            path="/test"
            element={
              <ProtectedRoute requireAuth={true}>
                <div>Test Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        { store, route: '/test' }
      );

      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('should allow access when requireAuth is false', () => {
      const store = createTestStore({ isAuthenticated: false });
      
      renderWithProviders(
        <Routes>
          <Route
            path="/results"
            element={
              <ProtectedRoute requireAuth={false} requireTestCompletion>
                <div>Results</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        { store, route: '/results' }
      );

      // Should redirect to /test because of requireTestCompletion, not auth
      expect(screen.queryByText('Results')).not.toBeInTheDocument();
    });

    it('should handle both auth and test completion requirements', () => {
      const store = createTestStore(
        { isAuthenticated: true, user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() } },
        { result: { character: 'zombie', mbtiType: 'ESTJ', description: 'Test' } }
      );
      
      renderWithProviders(
        <Routes>
          <Route
            path="/results"
            element={
              <ProtectedRoute requireAuth={true} requireTestCompletion>
                <div>Results Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        { store, route: '/results' }
      );

      expect(screen.getByText('Results Content')).toBeInTheDocument();
    });
  });
});
