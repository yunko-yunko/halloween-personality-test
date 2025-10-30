# Configuration Module

## Feature Flags

The feature flag system allows the application to operate in two modes:

### Simple Mode (VITE_ENABLE_EMAIL_AUTH=false)
- No authentication required
- No data persistence
- Immediate test access
- No user profiles or history

### Advanced Mode (VITE_ENABLE_EMAIL_AUTH=true)
- Email verification required
- User profiles and test history
- Data persistence
- Email notifications

## Usage Examples

### In React Router
```typescript
import { features } from '@/config';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/test" 
          element={
            features.emailAuth 
              ? <ProtectedRoute><TestPage /></ProtectedRoute> 
              : <TestPage />
          } 
        />
        <Route path="/results" element={<ResultsPage />} />
        
        {features.emailAuth && (
          <>
            <Route path="/auth/email" element={<EmailEntryPage />} />
            <Route path="/auth/verify" element={<VerifyPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </>
        )}
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### In Components
```typescript
import { features } from '@/config';

function CharacterResult({ character, description }: Props) {
  return (
    <div>
      <h2>{character.name}</h2>
      <p>{description}</p>
      
      <button onClick={handleRetake}>다시 테스트하기</button>
      
      {features.emailAuth && (
        <button onClick={handleViewProfile}>프로필 보기</button>
      )}
    </div>
  );
}
```

### In Services
```typescript
import { features } from '@/config';

export const testService = {
  async submitTest(answers: Answer[]) {
    const response = await api.post('/test/submit', { answers });
    
    if (features.emailAuth) {
      // Result is saved and email sent
      console.log('Result saved to profile');
    } else {
      // Result is temporary
      console.log('Result not saved (simple mode)');
    }
    
    return response.data;
  }
};
```

## Environment Variables

See `.env.example` for all required environment variables.

### Required in All Modes
- `VITE_ENABLE_EMAIL_AUTH`: Feature flag (true/false)
- `VITE_API_URL`: Backend API base URL

### Vite Environment Variables

Vite exposes environment variables prefixed with `VITE_` to the client code.
Variables are loaded from `.env` files and can be accessed via `import.meta.env`.

Example:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const isEmailAuthEnabled = import.meta.env.VITE_ENABLE_EMAIL_AUTH === 'true';
```
