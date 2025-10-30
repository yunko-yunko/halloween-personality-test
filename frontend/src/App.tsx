import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, TestPage, ResultsPage, EmailEntryPage, VerifyPage, ProfilePage } from './pages';
import { ProtectedRoute, ErrorBoundary } from './components';
import { features } from './config/features';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/test" 
            element={
              features.emailAuth ? (
                <ProtectedRoute requireAuth={true}>
                  <TestPage />
                </ProtectedRoute>
              ) : (
                <TestPage />
              )
            } 
          />
          <Route 
            path="/results" 
            element={
              <ProtectedRoute requireTestCompletion requireAuth={false}>
                <ResultsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Advanced mode routes */}
          {features.emailAuth && (
            <>
              <Route path="/auth/email" element={<EmailEntryPage />} />
              <Route path="/auth/verify" element={<VerifyPage />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
            </>
          )}
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
