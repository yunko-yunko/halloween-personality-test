import { configureStore } from '@reduxjs/toolkit';
import testReducer from './slices/testSlice';
import authReducer from './slices/authSlice';

// ============================================================================
// Store Configuration
// ============================================================================

export const store = configureStore({
  reducer: {
    test: testReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for date serialization
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/checkAuth/fulfilled',
          'auth/setUser',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt'],
      },
    }),
});

// ============================================================================
// Types
// ============================================================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
