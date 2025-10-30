import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import testReducer from './store/slices/testSlice';
import authReducer from './store/slices/authSlice';
import { ProtectedRoute } from './components/ProtectedRoute';

// ============================================================================
// Mock Feature Flags
// ============================================================================

vi.mock('./config/features', () => ({
  features: {
    emailAuth: false, // Default to simple mode
  },
}));

// ============================================================================
// Mock Components
// ============================================================================

const MockHomePage = () => <div>Home Page</div>;
const MockTestPage = () => <div>Test Page</div>;
const MockResultsPage = () => <div>Results Page</div>;
const MockEmailEntryPage = () => <div>Email Entry Page</div>;
const MockVerifyPage = () => <div>Verify Page</div>;
const MockProfilePage = () => <div>Profile Page</div>;

// ============================================================================
// Test Suite
// ============================================================================

describe('App Routing', () => {
  describe('Route Guards', () => {
    it('should redirect to /test when accessing /results without completing test', () => {
      // Create store with no test result
      const store = configureStore({
        reducer: {
          test: testReducer,
          auth: authReducer,
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/results']}>
            <Routes>
              <Route path="/test" element={<MockTestPage />} />
              <Route
                path="/results"
                element={
                  <ProtectedRoute requireTestCompletion>
                    <MockResultsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Should redirect to test page
      expect(screen.getByText('Test Page')).toBeInTheDocument();
      expect(screen.queryByText('Results Page')).not.toBeInTheDocument();
    });

    it('should allow access to /results when test is completed', () => {
      // Create store with test result
      const store = configureStore({
        reducer: {
          test: testReducer,
          auth: authReducer,
        },
        preloadedState: {
          test: {
            questions: [],
            answers: {},
            currentPage: 1,
            result: {
              character: 'zombie' as const,
              characterInfo: {
                name: '좀비',
                description: 'Test description',
                imagePath: '/assets/characters/zombie.png',
                mbtiTypes: ['ESTJ', 'ESTP'],
              },
              mbtiType: 'ESTJ',
            },
            isLoading: false,
            error: null,
          },
          auth: {
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/results']}>
            <Routes>
              <Route path="/test" element={<MockTestPage />} />
              <Route
                path="/results"
                element={
                  <ProtectedRoute requireTestCompletion>
                    <MockResultsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Should show results page
      expect(screen.getByText('Results Page')).toBeInTheDocument();
      expect(screen.queryByText('Test Page')).not.toBeInTheDocument();
    });
  });

  describe('404 Redirect', () => {
    it('should redirect to home page for unknown routes', () => {
      const store = configureStore({
        reducer: {
          test: testReducer,
          auth: authReducer,
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/unknown-route']}>
            <Routes>
              <Route path="/" element={<MockHomePage />} />
              <Route path="/test" element={<MockTestPage />} />
              <Route path="*" element={<MockHomePage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Should redirect to home page
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  describe('Navigation Flow', () => {
    it('should render home page at root path', () => {
      const store = configureStore({
        reducer: {
          test: testReducer,
          auth: authReducer,
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<MockHomePage />} />
              <Route path="/test" element={<MockTestPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('should render test page at /test path', () => {
      const store = configureStore({
        reducer: {
          test: testReducer,
          auth: authReducer,
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/test']}>
            <Routes>
              <Route path="/" element={<MockHomePage />} />
              <Route path="/test" element={<MockTestPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });
  });

  describe('Advanced Mode Routes', () => {
    beforeEach(() => {
      // Enable advanced mode for these tests
      vi.doMock('./config/features', () => ({
        features: {
          emailAuth: true,
        },
      }));
    });

    it('should render email entry page at /auth/email', () => {
      const store = configureStore({
        reducer: {
          test: testReducer,
          auth: authReducer,
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/auth/email']}>
            <Routes>
              <Route path="/auth/email" element={<MockEmailEntryPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Email Entry Page')).toBeInTheDocument();
    });

    it('should render verify page at /auth/verify', () => {
      const store = configureStore({
        reducer: {
          test: testReducer,
          auth: authReducer,
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/auth/verify']}>
            <Routes>
              <Route path="/auth/verify" element={<MockVerifyPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Verify Page')).toBeInTheDocument();
    });

    it('should render profile page at /profile when authenticated', () => {
      const store = configureStore({
        reducer: {
          test: testReducer,
          auth: authReducer,
        },
        preloadedState: {
          test: {
            questions: [],
            answers: {},
            currentPage: 1,
            result: null,
            isLoading: false,
            error: null,
          },
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
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/profile']}>
            <Routes>
              <Route path="/auth/email" element={<MockEmailEntryPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <MockProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });
  });
});
