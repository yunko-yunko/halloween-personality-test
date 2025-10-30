# Configuration Module

## Feature Flags

The feature flag system allows the application to operate in two modes:

### Simple Mode (ENABLE_EMAIL_AUTH=false)
- No authentication required
- No data persistence
- Immediate test access
- No user profiles or history

### Advanced Mode (ENABLE_EMAIL_AUTH=true)
- Email verification required
- User profiles and test history
- Data persistence in PostgreSQL
- Email notifications via AWS SES

## Usage Examples

### In Controllers
```typescript
import { features } from '../config';

export const submitTest = async (req: Request, res: Response) => {
  const result = calculateTestResult(req.body.answers);
  
  if (features.emailAuth && req.user) {
    // Save result to database
    await testResultRepository.create({
      userId: req.user.id,
      ...result
    });
    
    // Send result email
    await emailService.sendResultEmail(req.user.email, result);
  }
  
  res.json(result);
};
```

### In Middleware
```typescript
import { features } from '../config';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!features.emailAuth) {
    return next(); // Skip auth in simple mode
  }
  
  // Verify JWT token
  const token = req.cookies.session_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... verify token logic
  next();
};
```

### In Service Factory
```typescript
import { features } from '../config';

export function createEmailService(): IEmailService {
  if (features.emailAuth) {
    return new SESEmailService();
  }
  return new NoOpEmailService();
}

export function createUserRepository(): IUserRepository {
  if (features.emailAuth) {
    return new PostgresUserRepository();
  }
  return new NoOpUserRepository();
}
```

## Environment Variables

See `.env.example` for all required environment variables.

### Required in All Modes
- `ENABLE_EMAIL_AUTH`: Feature flag (true/false)
- `PORT`: Server port
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

### Required Only in Advanced Mode
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database credentials
- `AWS_REGION`, `AWS_SES_FROM_EMAIL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `JWT_SECRET`, `JWT_EXPIRES_IN`: JWT configuration
