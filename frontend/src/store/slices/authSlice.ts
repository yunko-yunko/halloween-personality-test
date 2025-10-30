import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { authService } from '../../services/authService';

// ============================================================================
// State Interface
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// SessionStorage Keys
// ============================================================================

const AUTH_STORAGE_KEY = 'halloween_auth_state';

// ============================================================================
// SessionStorage Helpers
// ============================================================================

/**
 * Load auth state from sessionStorage
 */
const loadAuthFromStorage = (): Partial<AuthState> | null => {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (parsed.user) {
        parsed.user.createdAt = new Date(parsed.user.createdAt);
        parsed.user.updatedAt = new Date(parsed.user.updatedAt);
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load auth state from sessionStorage:', error);
  }
  return null;
};

/**
 * Save auth state to sessionStorage
 */
const saveAuthToStorage = (state: AuthState): void => {
  try {
    const toStore = {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
    };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Failed to save auth state to sessionStorage:', error);
  }
};

/**
 * Clear auth state from sessionStorage
 */
const clearAuthFromStorage = (): void => {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth state from sessionStorage:', error);
  }
};

// ============================================================================
// Initial State
// ============================================================================

const storedAuth = loadAuthFromStorage();

const initialState: AuthState = {
  isAuthenticated: storedAuth?.isAuthenticated ?? false,
  user: storedAuth?.user ?? null,
  loading: false,
  error: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Verify token and login user
 * Called when user clicks verification link from email
 */
export const login = createAsyncThunk<User, string, { rejectValue: string }>(
  'auth/login',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authService.verifyToken(token);
      return response.user;
    } catch (error: any) {
      const message = error.response?.data?.message || '인증에 실패했습니다.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Check authentication status
 * Called on app initialization to verify existing session
 */
export const checkAuth = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.user;
    } catch (error: any) {
      // Not authenticated or session expired
      return rejectWithValue('Not authenticated');
    }
  }
);

/**
 * Logout user
 * Clears session on backend and frontend
 */
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      // Even if backend logout fails, we should clear frontend state
      console.error('Logout error:', error);
      return rejectWithValue('로그아웃에 실패했습니다.');
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set user (for manual updates)
    setUser: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      saveAuthToStorage(state);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Manual logout (without API call)
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      clearAuthFromStorage();
    },
  },
  extraReducers: (builder) => {
    // ========================================================================
    // Login (verify token)
    // ========================================================================
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
      saveAuthToStorage(state);
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = action.payload || '인증에 실패했습니다.';
      clearAuthFromStorage();
    });

    // ========================================================================
    // Check Auth (verify existing session)
    // ========================================================================
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
      saveAuthToStorage(state);
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null; // Don't show error for failed auth check
      clearAuthFromStorage();
    });

    // ========================================================================
    // Logout
    // ========================================================================
    builder.addCase(logoutUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      clearAuthFromStorage();
    });
    builder.addCase(logoutUser.rejected, (state) => {
      // Even if logout fails on backend, clear frontend state
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      clearAuthFromStorage();
    });
  },
});

// ============================================================================
// Actions
// ============================================================================

export const { setUser, clearError, clearAuth } = authSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// ============================================================================
// Reducer
// ============================================================================

export default authSlice.reducer;
