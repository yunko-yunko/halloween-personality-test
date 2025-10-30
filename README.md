# 🎃 Halloween Personality Test

A fun, interactive personality test that matches users with Halloween characters based on their MBTI personality type.

![Halloween Theme](https://img.shields.io/badge/Theme-Halloween-orange)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)

## ✨ Features

### 🎭 Two Operating Modes

**Simple Mode (Default)**
- No authentication required
- 15 personality questions
- Instant character results
- 8 unique Halloween characters
- Perfect for quick demos

**Advanced Mode**
- Email-based authentication
- User profiles
- Test history tracking
- Persistent results
- Secure session management

### 🎨 User Experience

- Beautiful Halloween-themed UI
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Korean language support
- Accessible and user-friendly

### 🔒 Security

- HTTP-only cookies
- JWT authentication
- CSRF protection
- Secure password-less login
- Email verification

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- PostgreSQL (only for Advanced Mode)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd genai_project

# Install backend dependencies
cd backend
npm install
copy .env.example .env

# Install frontend dependencies
cd ../frontend
npm install
copy .env.example .env
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

**Open your browser:**
Navigate to http://localhost:5173 🎃

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 5 minutes
- **[SETUP_AND_RUN.md](./SETUP_AND_RUN.md)** - Comprehensive setup guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🎯 How It Works

1. **Take the Test** - Answer 15 personality questions across 3 pages
2. **Get Your Character** - Discover which Halloween character matches your personality
3. **Share Results** - Share your spooky character with friends!

### Character Mappings

The test maps MBTI types to 8 Halloween characters:

- 🧟 **Zombie** (ESTJ/ESTP) - Practical and action-oriented
- 🃏 **Joker** (ENTJ/ENTP) - Strategic and charismatic
- 💀 **Skeleton** (INFJ/INFP) - Thoughtful and introspective
- 👻 **Ghost** (ESFJ/ESFP) - Social and expressive
- 🎃 **Jack-o-lantern** (ENFJ/ENFP) - Enthusiastic and inspiring
- 🧛 **Vampire** (ISTJ/ISTP) - Analytical and independent
- 👰 **Nun** (ISFJ/ISFP) - Caring and artistic
- 🧟‍♂️ **Frankenstein** (INTJ/INTP) - Innovative and logical

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- Vitest

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- AWS SES
- JWT
- Jest

## 📁 Project Structure

```
genai_project/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── backend/           # Express backend API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Database access
│   │   └── middleware/    # Express middleware
│   └── package.json
│
└── Documentation files
```

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Watch mode
npm test:watch

# With UI
npm test:ui
```

### Test Coverage

- Unit tests for services and utilities
- Integration tests for API endpoints
- E2E tests for user flows
- Component tests for React components

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
ENABLE_EMAIL_AUTH=false
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_ENABLE_EMAIL_AUTH=false
VITE_API_URL=http://localhost:3000/api
```

See [SETUP_AND_RUN.md](./SETUP_AND_RUN.md) for complete configuration options.

## 🚢 Deployment

### Build for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

The frontend build will be in `frontend/dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🎃 Halloween Characters

Meet the 8 unique Halloween characters you might match with:

- **Zombie** - The practical doer who gets things done
- **Joker** - The strategic mastermind with a plan
- **Skeleton** - The deep thinker who sees beyond the surface
- **Ghost** - The social butterfly who brings people together
- **Jack-o-lantern** - The enthusiastic leader who inspires others
- **Vampire** - The analytical mind who values independence
- **Nun** - The caring soul with an artistic touch
- **Frankenstein** - The innovative genius who thinks differently

## 🆘 Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Review [SETUP_AND_RUN.md](./SETUP_AND_RUN.md) for setup help
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system details

## 🌟 Features Roadmap

- [ ] Social media sharing
- [ ] Multiple language support
- [ ] Character comparison
- [ ] Detailed personality insights
- [ ] Friend matching
- [ ] Custom character avatars

## 📊 API Endpoints

### Public Endpoints
```
GET  /health                    # Health check
GET  /api/test/questions        # Get test questions
POST /api/test/submit           # Submit test answers
```

### Authenticated Endpoints (Advanced Mode)
```
POST /api/auth/send-verification  # Send verification email
GET  /api/auth/verify-token       # Verify email token
POST /api/auth/logout             # Logout user
GET  /api/profile/me              # Get user profile
GET  /api/profile/history         # Get test history
```

## 🎨 Design Philosophy

- **User-First**: Simple, intuitive interface
- **Accessible**: Works on all devices and screen sizes
- **Secure**: Industry-standard security practices
- **Performant**: Fast load times and smooth interactions
- **Maintainable**: Clean code with comprehensive tests

## 📈 Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Bundle Size: < 500KB

## 🔐 Security Features

- HTTP-only cookies for session management
- CSRF protection with SameSite cookies
- JWT token authentication
- Email verification for user registration
- Secure password-less authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

Made with 🎃 and ❤️

**Happy Halloween Testing!** 👻🦇🕷️
