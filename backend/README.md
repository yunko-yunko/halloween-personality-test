# Halloween Personality Test - Backend

Express.js + TypeScript backend for the Halloween Personality Test application.

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   ├── routes/         # Express routes
│   ├── middleware/     # Express middleware
│   ├── database/       # Database connection and migrations
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── dist/               # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update environment variables in `.env` file

## Development

Start the development server with hot reload:
```bash
npm run dev
```

## Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

## Production

Run the compiled application:
```bash
npm start
```

## Environment Variables

See `.env.example` for all required environment variables.

### Feature Flags
- `ENABLE_EMAIL_AUTH`: Enable/disable email authentication (true/false)

### Server
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

### Database (Advanced Mode)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### AWS (Advanced Mode)
- `AWS_REGION`, `AWS_SES_FROM_EMAIL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

### JWT
- `JWT_SECRET`, `JWT_EXPIRES_IN`

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Test Routes (to be implemented)
- `GET /api/test/questions` - Get all questions
- `POST /api/test/submit` - Submit test answers

### Auth Routes (Advanced Mode - to be implemented)
- `POST /api/auth/send-verification` - Send verification email
- `GET /api/auth/verify-token` - Verify token
- `POST /api/auth/logout` - Logout

### Profile Routes (Advanced Mode - to be implemented)
- `GET /api/profile/me` - Get current user
- `GET /api/profile/history` - Get test history
