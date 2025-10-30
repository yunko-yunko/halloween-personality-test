# 🏗️ Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                     http://localhost:5173                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Frontend (React + Vite)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Components:                                             │  │
│  │  - HomePage (Landing page)                               │  │
│  │  - TestPage (15 questions, 3 pages)                      │  │
│  │  - ResultsPage (Character result)                        │  │
│  │  - EmailEntryPage (Advanced mode only)                   │  │
│  │  - ProfilePage (Advanced mode only)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  State Management (Redux):                               │  │
│  │  - testSlice (test state, answers, results)             │  │
│  │  - authSlice (user authentication)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services:                                               │  │
│  │  - testService (API calls for test)                     │  │
│  │  - authService (API calls for auth)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ API Calls (axios)
                             │ http://localhost:3000/api
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   Backend (Express.js + TypeScript)             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes:                                                 │  │
│  │  - /api/test/questions (GET)                            │  │
│  │  - /api/test/submit (POST)                              │  │
│  │  - /api/auth/send-verification (POST)                   │  │
│  │  - /api/auth/verify-token (GET)                         │  │
│  │  - /api/auth/logout (POST)                              │  │
│  │  - /api/profile/me (GET)                                │  │
│  │  - /api/profile/history (GET)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services:                                               │  │
│  │  - TestService (test logic)                             │  │
│  │  - AuthService (authentication)                         │  │
│  │  - EmailService (send emails via AWS SES)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware:                                             │  │
│  │  - CORS (cross-origin requests)                         │  │
│  │  - Cookie Parser (session cookies)                      │  │
│  │  - Auth Middleware (JWT verification)                   │  │
│  │  - Error Handler (centralized errors)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
┌───────────────────────────┐  ┌──────────────────────┐
│   PostgreSQL Database     │  │      AWS SES         │
│   (Advanced Mode Only)    │  │  (Advanced Mode Only)│
│                           │  │                      │
│  Tables:                  │  │  - Send verification │
│  - users                  │  │    emails            │
│  - test_results           │  │  - Magic link auth   │
│  - verification_tokens    │  │                      │
└───────────────────────────┘  └──────────────────────┘
```

## Data Flow

### Simple Mode (No Authentication)

```
1. User visits homepage
   └─> Frontend loads

2. User clicks "Start Test"
   └─> Navigate to /test
   └─> Frontend calls GET /api/test/questions
   └─> Backend returns 15 questions
   └─> Frontend displays questions (5 per page)

3. User answers questions
   └─> Answers stored in Redux state
   └─> Navigate between pages (1/3, 2/3, 3/3)

4. User submits test
   └─> Frontend calls POST /api/test/submit
   └─> Backend calculates MBTI type
   └─> Backend maps to Halloween character
   └─> Backend returns character result
   └─> Frontend displays result
   └─> Result stored in Redux (temporary)

5. User closes browser
   └─> All data lost (no persistence)
```

### Advanced Mode (With Authentication)

```
1. User visits homepage
   └─> Frontend loads
   └─> Check for existing session (sessionStorage)

2. User clicks "Start Test"
   └─> Redirect to /auth/email (not authenticated)

3. User enters email
   └─> Frontend calls POST /api/auth/send-verification
   └─> Backend generates verification token
   └─> Backend stores token in database
   └─> Backend sends email via AWS SES
   └─> Frontend shows "Check your email" message

4. User clicks email link
   └─> Link contains token: /auth/verify?token=xxx
   └─> Frontend calls GET /api/auth/verify-token
   └─> Backend validates token
   └─> Backend creates/retrieves user
   └─> Backend generates JWT
   └─> Backend sets HTTP-only cookie
   └─> Backend returns user data
   └─> Frontend stores auth state (Redux + sessionStorage)
   └─> Redirect to /test (new user) or /profile (returning user)

5. User takes test
   └─> Same as Simple Mode
   └─> But result is saved to database

6. User views profile
   └─> Frontend calls GET /api/profile/history
   └─> Backend returns all past test results
   └─> Frontend displays test history

7. User logs out
   └─> Frontend calls POST /api/auth/logout
   └─> Backend clears cookie
   └─> Frontend clears Redux + sessionStorage
   └─> Redirect to homepage
```

## Security Architecture

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Enter email
       ▼
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       │ 2. POST /auth/send-verification
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │
       │ 3. Generate token
       │    Store in DB
       ▼
┌─────────────┐
│  Database   │
└─────────────┘
       │
       │ 4. Send email
       ▼
┌─────────────┐
│   AWS SES   │
└──────┬──────┘
       │
       │ 5. Email with link
       ▼
┌─────────────┐
│    Email    │
└──────┬──────┘
       │
       │ 6. Click link
       ▼
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 7. GET /auth/verify-token?token=xxx
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │
       │ 8. Validate token
       │    Create/get user
       │    Generate JWT
       │    Set HTTP-only cookie
       ▼
┌─────────────┐
│   Browser   │ ← Cookie stored
└─────────────┘
       │
       │ 9. All future requests
       │    include cookie automatically
       ▼
┌─────────────┐
│   Backend   │ ← Verifies JWT from cookie
└─────────────┘
```

### Cookie Security

```
Set-Cookie: session_token=<JWT>
  ├─ httpOnly: true        ← Cannot be accessed by JavaScript
  ├─ secure: true          ← HTTPS only (production)
  ├─ sameSite: 'strict'    ← CSRF protection
  └─ maxAge: 24h           ← Expires after 24 hours
```

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database (advanced mode)
- **AWS SES** - Email service (advanced mode)
- **JWT** - Authentication tokens
- **Jest** - Testing framework

## File Structure

```
genai_project/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── EmailVerificationForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── CharacterResult.tsx
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── TestPage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   ├── EmailEntryPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── VerifyPage.tsx
│   │   ├── store/           # Redux store
│   │   │   ├── slices/
│   │   │   │   ├── testSlice.ts
│   │   │   │   └── authSlice.ts
│   │   │   └── store.ts
│   │   ├── services/        # API services
│   │   │   ├── api.ts
│   │   │   ├── testService.ts
│   │   │   └── authService.ts
│   │   ├── types/           # TypeScript types
│   │   ├── data/            # Static data
│   │   │   ├── questions.json
│   │   │   └── character-descriptions.json
│   │   ├── config/          # Configuration
│   │   │   └── features.ts
│   │   └── App.tsx          # Main app component
│   ├── .env                 # Environment variables
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── testRoutes.ts
│   │   │   ├── authRoutes.ts
│   │   │   └── profileRoutes.ts
│   │   ├── controllers/     # Route controllers
│   │   │   ├── testController.ts
│   │   │   ├── authController.ts
│   │   │   └── profileController.ts
│   │   ├── services/        # Business logic
│   │   │   ├── TestService.ts
│   │   │   ├── AuthService.ts
│   │   │   ├── EmailService.ts
│   │   │   └── VerificationTokenService.ts
│   │   ├── repositories/    # Database access
│   │   │   ├── UserRepository.ts
│   │   │   ├── TestResultRepository.ts
│   │   │   └── VerificationTokenRepository.ts
│   │   ├── middleware/      # Express middleware
│   │   │   ├── authMiddleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── database/        # Database setup
│   │   │   ├── pool.ts
│   │   │   └── migrations/
│   │   ├── utils/           # Utilities
│   │   │   ├── jwt.ts
│   │   │   └── validation.ts
│   │   ├── types/           # TypeScript types
│   │   ├── config/          # Configuration
│   │   │   └── features.ts
│   │   └── server.ts        # Main server file
│   ├── .env                 # Environment variables
│   └── package.json
│
└── Documentation files
```

## Environment Variables

### Frontend (.env)
```env
VITE_ENABLE_EMAIL_AUTH=false    # Feature flag
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```env
# Feature flag
ENABLE_EMAIL_AUTH=false

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (advanced mode only)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halloween_test
DB_USER=postgres
DB_PASSWORD=password

# AWS SES (advanced mode only)
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@domain.com
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# JWT (advanced mode only)
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

## API Endpoints

### Test Endpoints (Both Modes)
```
GET  /api/test/questions     # Get 15 test questions
POST /api/test/submit        # Submit answers, get character result
```

### Auth Endpoints (Advanced Mode Only)
```
POST /api/auth/send-verification  # Send verification email
GET  /api/auth/verify-token       # Verify token, create session
POST /api/auth/logout             # Clear session
```

### Profile Endpoints (Advanced Mode Only)
```
GET /api/profile/me        # Get current user info
GET /api/profile/history   # Get user's test history
```

### Health Check
```
GET /health                # Server health status
```

## Database Schema (Advanced Mode)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Test results table
CREATE TABLE test_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  character_type VARCHAR(50) NOT NULL,
  mbti_type VARCHAR(4) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Verification tokens table
CREATE TABLE verification_tokens (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

For setup instructions, see [SETUP_AND_RUN.md](./SETUP_AND_RUN.md)

For quick start, see [QUICK_START.md](./QUICK_START.md)
