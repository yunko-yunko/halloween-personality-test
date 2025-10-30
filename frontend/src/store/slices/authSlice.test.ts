import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  checkAuth,
  logoutUser,
  setUser,
  clearError,
  clearAuth,
  type AuthState,
} from './authSlice';
import type { User } from '../../types';
import { authService } from '../../services/authService';

// ============================================================================
// Mock authService
// ============================================================================

vi.mock('../../services/authService', () => ({
  authService: {
    verifyToken: vi.fn(),
    getProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// ============================================================================
// Mock Data
// ============================================================================

const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ============================================================================
// Helper Functions
// ============================================================================

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
};

// ============================================================================
// Tests
// ============================================================================

describe('authSlice', () => {
  let initialState: AuthState;

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    vi.clearAllMocks();

    initialState = {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    };
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('initial state', () => {
    it('should return the initial state when no stored auth', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should save and load auth state from sessionStorage', () => {
      // First, save auth state
      const state = authReducer(initialState, setUser(mockUser));
      expect(state.isAuthenticated).toBe(true);

      // Verify it was saved to sessionStorage
      const stored = sessionStorage.getItem('halloween_auth_state');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.isAuthenticated).toBe(true);
      expect(parsed.user.email).toBe(mockUser.email);
    });
  });

  describe('synchronous actions', () => {
    describe('setUser', () => {
      it('should set user and authenticated state', () => {
        const state = authReducer(initialState, setUser(mockUser));
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.error).toBeNull();
      });

      it('should save to sessionStorage', () => {
        authReducer(initialState, setUser(mockUser));
        const stored = sessionStorage.getItem('halloween_auth_state');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.isAuthenticated).toBe(true);
        expect(parsed.user.email).toBe(mockUser.email);
      });
    });

    describe('clearError', () => {
      it('should clear error', () => {
        const stateWithError = { ...initialState, error: 'Some error' };
        const state = authReducer(stateWithError, clearError());
        expect(state.error).toBeNull();
      });

      it('should not affect other state', () => {
        const stateWithError = {
          isAuthenticated: true,
          user: mockUser,
          loading: false,
          error: 'Some error',
        };
        const state = authReducer(stateWithError, clearError());
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.loading).toBe(false);
      });
    });

    describe('clearAuth', () => {
      it('should clear all auth state', () => {
        const authenticatedState = {
          isAuthenticated: true,
          user: mockUser,
          loading: false,
          error: null,
        };
        const state = authReducer(authenticatedState, clearAuth());
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should clear sessionStorage', () => {
        sessionStorage.setItem('halloween_auth_state', JSON.stringify({ user: mockUser }));
        authReducer(initialState, clearAuth());
        expect(sessionStorage.getItem('halloween_auth_state')).toBeNull();
      });
    });
  });

  describe('login async thunk', () => {
    it('should handle login.pending', () => {
      const state = authReducer(initialState, login.pending('', ''));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle login.fulfilled', () => {
      const state = authReducer(initialState, login.fulfilled(mockUser, '', ''));
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should save to sessionStorage on login.fulfilled', () => {
      authReducer(initialState, login.fulfilled(mockUser, '', ''));
      const stored = sessionStorage.getItem('halloween_auth_state');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.isAuthenticated).toBe(true);
    });

    it('should handle login.rejected', () => {
      const errorMessage = '인증에 실패했습니다.';
      const state = authReducer(
        initialState,
        login.rejected(new Error(errorMessage), '', '', errorMessage)
      );
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should clear sessionStorage on login.rejected', () => {
      sessionStorage.setItem('halloween_auth_state', JSON.stringify({ user: mockUser }));
      authReducer(initialState, login.rejected(new Error('error'), '', '', 'error'));
      expect(sessionStorage.getItem('halloween_auth_state')).toBeNull();
    });

    it('should call authService.verifyToken', async () => {
      const store = createTestStore();
      const token = 'test-token';

      vi.mocked(authService.verifyToken).mockResolvedValue({
        user: mockUser,
        message: 'Success',
      });

      await store.dispatch(login(token));

      expect(authService.verifyToken).toHaveBeenCalledWith(token);
    });

    it('should handle API error in login', async () => {
      const store = createTestStore();
      const errorMessage = '유효하지 않은 토큰입니다.';

      vi.mocked(authService.verifyToken).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(login('invalid-token'));

      const state = store.getState().auth;
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth async thunk', () => {
    it('should handle checkAuth.pending', () => {
      const state = authReducer(initialState, checkAuth.pending('', undefined));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle checkAuth.fulfilled', () => {
      const state = authReducer(initialState, checkAuth.fulfilled(mockUser, '', undefined));
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should save to sessionStorage on checkAuth.fulfilled', () => {
      authReducer(initialState, checkAuth.fulfilled(mockUser, '', undefined));
      const stored = sessionStorage.getItem('halloween_auth_state');
      expect(stored).toBeTruthy();
    });

    it('should handle checkAuth.rejected without error message', () => {
      const state = authReducer(
        initialState,
        checkAuth.rejected(new Error('Not authenticated'), '', undefined)
      );
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull(); // Should not show error for failed auth check
    });

    it('should call authService.getProfile', async () => {
      const store = createTestStore();

      vi.mocked(authService.getProfile).mockResolvedValue({
        user: mockUser,
      });

      await store.dispatch(checkAuth());

      expect(authService.getProfile).toHaveBeenCalled();
    });

    it('should handle unauthenticated state gracefully', async () => {
      const store = createTestStore();

      vi.mocked(authService.getProfile).mockRejectedValue({
        response: { status: 401 },
      });

      await store.dispatch(checkAuth());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('logoutUser async thunk', () => {
    it('should handle logoutUser.pending', () => {
      const state = authReducer(initialState, logoutUser.pending('', undefined));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle logoutUser.fulfilled', () => {
      const authenticatedState = {
        isAuthenticated: true,
        user: mockUser,
        loading: false,
        error: null,
      };
      const state = authReducer(authenticatedState, logoutUser.fulfilled(undefined, '', undefined));
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear sessionStorage on logoutUser.fulfilled', () => {
      sessionStorage.setItem('halloween_auth_state', JSON.stringify({ user: mockUser }));
      authReducer(initialState, logoutUser.fulfilled(undefined, '', undefined));
      expect(sessionStorage.getItem('halloween_auth_state')).toBeNull();
    });

    it('should handle logoutUser.rejected and still clear state', () => {
      const authenticatedState = {
        isAuthenticated: true,
        user: mockUser,
        loading: false,
        error: null,
      };
      const state = authReducer(
        authenticatedState,
        logoutUser.rejected(new Error('Logout failed'), '', undefined)
      );
      // Even on error, should clear frontend state
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
    });

    it('should call authService.logout', async () => {
      const store = createTestStore();

      vi.mocked(authService.logout).mockResolvedValue({
        message: 'Logged out',
      });

      await store.dispatch(logoutUser());

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should clear state even if API call fails', async () => {
      const store = createTestStore();

      vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'));

      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('complex scenarios', () => {
    it('should handle login after failed login', async () => {
      const store = createTestStore();

      // First login fails
      vi.mocked(authService.verifyToken).mockRejectedValueOnce({
        response: { data: { message: 'Invalid token' } },
      });
      await store.dispatch(login('bad-token'));
      expect(store.getState().auth.error).toBeTruthy();

      // Second login succeeds
      vi.mocked(authService.verifyToken).mockResolvedValueOnce({
        user: mockUser,
        message: 'Success',
      });
      await store.dispatch(login('good-token'));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBeNull();
    });

    it('should handle logout after successful login', async () => {
      const store = createTestStore();

      // Login
      vi.mocked(authService.verifyToken).mockResolvedValue({
        user: mockUser,
        message: 'Success',
      });
      await store.dispatch(login('token'));
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Logout
      vi.mocked(authService.logout).mockResolvedValue({ message: 'Logged out' });
      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('should persist auth state to sessionStorage', () => {
      // Simulate login
      let state = authReducer(initialState, login.fulfilled(mockUser, '', ''));
      expect(state.isAuthenticated).toBe(true);

      // Verify sessionStorage has the data
      const stored = sessionStorage.getItem('halloween_auth_state');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.isAuthenticated).toBe(true);
      expect(parsed.user.id).toBe(mockUser.id);
      expect(parsed.user.email).toBe(mockUser.email);
    });

    it('should handle checkAuth on app initialization', async () => {
      const store = createTestStore();

      vi.mocked(authService.getProfile).mockResolvedValue({
        user: mockUser,
      });

      await store.dispatch(checkAuth());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });
  });
});
