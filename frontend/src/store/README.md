# Redux Store

This directory contains the Redux store configuration and slices for the Halloween Personality Test application.

## Structure

```
store/
├── slices/
│   ├── testSlice.ts       # Test state management
│   ├── testSlice.test.ts  # Test slice unit tests
│   ├── authSlice.ts       # Auth state management
│   └── authSlice.test.ts  # Auth slice unit tests
├── store.ts               # Store configuration
├── store.test.ts          # Store integration tests
├── hooks.ts               # Typed Redux hooks
├── index.ts               # Public exports
└── README.md              # This file
```

## Usage

### Setup

Wrap your app with the Redux Provider:

```tsx
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      {/* Your app components */}
    </Provider>
  );
}
```

### Using Typed Hooks

Always use the typed hooks instead of the plain `useDispatch` and `useSelector`:

```tsx
import { useAppDispatch, useAppSelector } from './store/hooks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  
  // ...
}
```

## Test Slice

Manages the personality test state including questions, answers, pagination, and results.

### State

```typescript
interface TestState {
  questions: Question[];
  answers: Record<string, string>; // questionId -> answerId
  currentPage: number;
  result: {
    character: HalloweenCharacter;
    characterInfo: CharacterInfo;
    mbtiType: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}
```

### Actions

- `setQuestions(questions)` - Load questions
- `setAnswer({ questionId, answerId })` - Set answer for a question
- `nextPage()` - Navigate to next page
- `prevPage()` - Navigate to previous page
- `setLoading(boolean)` - Set loading state
- `submitTestSuccess(result)` - Set test result after submission
- `submitTestFailure(error)` - Set error after submission failure
- `resetTest()` - Reset test for retaking
- `clearError()` - Clear error message

### Selectors

- `selectQuestions` - Get all questions
- `selectAnswers` - Get all answers
- `selectCurrentPage` - Get current page number
- `selectResult` - Get test result
- `selectIsLoading` - Get loading state
- `selectError` - Get error message
- `selectCurrentPageQuestions` - Get questions for current page (5 per page)
- `selectIsCurrentPageComplete` - Check if all questions on current page are answered
- `selectIsTestComplete` - Check if all questions are answered
- `selectTotalPages` - Get total number of pages
- `selectAnswersForSubmission` - Get answers formatted for API submission

### Example Usage

```tsx
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  selectCurrentPageQuestions,
  selectCurrentPage,
  selectTotalPages,
  setAnswer,
  nextPage,
  prevPage,
} from './store';

function TestPage() {
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectCurrentPageQuestions);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);

  const handleAnswer = (questionId: string, answerId: string) => {
    dispatch(setAnswer({ questionId, answerId }));
  };

  const handleNext = () => {
    dispatch(nextPage());
  };

  const handlePrev = () => {
    dispatch(prevPage());
  };

  return (
    <div>
      <h2>Page {currentPage} of {totalPages}</h2>
      {questions.map((question) => (
        <QuestionComponent
          key={question.id}
          question={question}
          onAnswer={handleAnswer}
        />
      ))}
      <button onClick={handlePrev}>Previous</button>
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

## Auth Slice

Manages authentication state for advanced mode (email verification).

### State

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

### Actions

- `setLoading(boolean)` - Set loading state
- `loginSuccess(user)` - Set authenticated user
- `loginFailure(error)` - Set login error
- `setUser(user)` - Set user (for existing session)
- `logout()` - Clear auth state
- `clearError()` - Clear error message
- `checkAuthStart()` - Start auth check
- `checkAuthSuccess(user)` - Auth check succeeded
- `checkAuthFailure()` - Auth check failed

### Selectors

- `selectIsAuthenticated` - Check if user is authenticated
- `selectUser` - Get current user
- `selectAuthLoading` - Get loading state
- `selectAuthError` - Get error message

### Example Usage

```tsx
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectIsAuthenticated, selectUser, logout } from './store';

function ProfilePage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth/email" />;
  }

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## Testing

Run tests with:

```bash
npm test                # Run all tests once
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI
```

All slices have comprehensive unit tests covering:
- Initial state
- All actions and reducers
- Selectors
- Edge cases and error scenarios
- Complex state transitions

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 1.2**: Test state management for tracking answers and calculating results
- **Requirement 2.5**: Pagination state management for navigating through test pages
