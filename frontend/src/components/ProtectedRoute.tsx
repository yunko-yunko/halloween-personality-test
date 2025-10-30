import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { features } from '../config/features';
import LoadingSpinner from './LoadingSpinner';

// ============================================================================
// ProtectedRoute Component
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireTestCompletion?: boolean;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that guards routes based on conditions
 * 
 * @param requireTestCompletion - If true, redirects to /test if no test result exists
 * @param requireAuth - If true, requires authentication in advanced mode (default: true)
 */
export function ProtectedRoute({ 
  children, 
  requireTestCompletion = false,
  requireAuth = true
}: ProtectedRouteProps) {
  const result = useSelector((state: RootState) => state.test.result);
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // Show loading state while checking authentication
  if (loading && features.emailAuth && requireAuth) {
    return (
      <div className="min-h-screen bg-halloween-darker flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Check authentication in advanced mode
  // If feature flag is disabled, allow access
  // If authenticated or feature flag disabled, proceed to other checks
  if (features.emailAuth && requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/email" replace />;
  }

  // If test completion is required but no result exists, redirect to test page
  if (requireTestCompletion && !result) {
    return <Navigate to="/test" replace />;
  }

  return <>{children}</>;
}
