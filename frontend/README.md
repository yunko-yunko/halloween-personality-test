# Halloween Personality Test - Frontend

React + Vite + TypeScript frontend application for the Halloween-themed MBTI personality test.

## Tech Stack

- **React 18+** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React Router v6** - Client-side routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling with custom Halloween theme

## Project Structure

```
src/
├── assets/          # Static assets
│   └── characters/  # Character images (zombie.png, joker.png, etc.)
├── components/      # Reusable UI components
├── pages/          # Route pages
├── store/          # Redux store and slices
├── services/       # API service layer
├── types/          # TypeScript type definitions
├── config/         # Configuration files (feature flags)
└── data/           # Static data (questions.json, character-descriptions.json)
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Feature Flags
VITE_ENABLE_EMAIL_AUTH=false

# API Configuration
VITE_API_URL=http://localhost:3000/api
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Tailwind CSS Theme

Custom Halloween theme colors are configured in `tailwind.config.js`:

- `halloween-dark` - #0a0a0a
- `halloween-darker` - #050505
- `halloween-orange` - #ff6b35
- `halloween-purple` - #6a0dad
- `halloween-green` - #39ff14
- `halloween-blood` - #8b0000

Custom fonts:
- `font-spooky` - Creepster (for headings)
- `font-korean` - Noto Sans KR (for Korean text)

## Feature Flags

The application supports two modes via the `VITE_ENABLE_EMAIL_AUTH` environment variable:

- **Simple Mode** (`false`): No authentication, immediate test access
- **Advanced Mode** (`true`): Email verification, user profiles, test history
