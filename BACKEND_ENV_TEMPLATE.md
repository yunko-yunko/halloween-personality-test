# Backend Environment Configuration Template

Complete `.env` file template with explanations for all configuration options.

---

## 📝 Complete `.env` Template

Copy this to `backend/.env` and fill in your values:

```env
# ============================================================================
# FEATURE FLAGS
# ============================================================================

# Enable email authentication and user profiles (advanced mode)
# Set to 'true' for full features, 'false' for simple mode
ENABLE_EMAIL_AUTH=true

# ============================================================================
# SERVER CONFIGURATION
# ============================================================================

# Port for the backend server
PORT=3000

# Environment (development, production, test)
NODE_ENV=development

# ============================================================================
# FRONTEND CONFIGURATION
# ============================================================================

# Frontend URL for CORS and email links
FRONTEND_URL=http://localhost:5173

# Comma-separated list of allowed origins for CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# ============================================================================
# DATABASE CONFIGURATION (Required when ENABLE_EMAIL_AUTH=true)
# ============================================================================

# PostgreSQL connection details
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halloween_test
DB_USER=postgres
DB_PASSWORD=your-database-password-here

# ============================================================================
# AWS SES CONFIGURATION (Required when ENABLE_EMAIL_AUTH=true)
# ============================================================================

# AWS Region where SES is configured
# Common options: us-east-1, us-west-2, eu-west-1
AWS_REGION=us-east-1

# Verified sender email address in AWS SES
# Must be verified in SES Console before use
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# IAM User Access Key ID (starts with AKIA)
# Get from IAM Console → Users → Security credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE

# IAM User Secret Access Key
# Get from IAM Console when creating access key (shown only once!)
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# ============================================================================
# JWT CONFIGURATION (Required when ENABLE_EMAIL_AUTH=true)
# ============================================================================

# Secret key for signing JWT tokens
# MUST be at least 32 characters for security
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-abc123def456

# JWT token expiration time
# Examples: 24h, 7d, 30d
JWT_EXPIRES_IN=24h
```

---

## 🔧 Configuration by Mode

### Simple Mode (No Authentication)

Minimal configuration needed:

```env
ENABLE_EMAIL_AUTH=false
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```

**What works:**
- ✅ Test taking
- ✅ Results display
- ✅ No login required

**What doesn't work:**
- ❌ Email authentication
- ❌ User profiles
- ❌ Test history
- ❌ Result persistence

---

### Advanced Mode (Full Features)

Complete configuration required:

```env
ENABLE_EMAIL_AUTH=true
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halloween_test
DB_USER=postgres
DB_PASSWORD=your-password

# AWS SES
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...

# JWT
JWT_SECRET=your-32-char-secret
JWT_EXPIRES_IN=24h
```

**What works:**
- ✅ Email authentication
- ✅ User profiles
- ✅ Test history
- ✅ Result persistence
- ✅ Returning user login

---

## 🔐 Security Best Practices

### 1. JWT Secret

**Generate secure secret:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**Requirements:**
- Minimum 32 characters
- Random and unpredictable
- Different for each environment (dev, staging, prod)
- Never commit to git

---

### 2. AWS Credentials

**Best practices:**
- Use IAM user with minimal permissions (only SES)
- Rotate access keys every 90 days
- Never commit to git
- Use AWS Secrets Manager in production
- Use IAM roles instead of keys when deploying to AWS

**Minimal IAM Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### 3. Database Password

**Best practices:**
- Use strong password (16+ characters)
- Mix uppercase, lowercase, numbers, symbols
- Different password for each environment
- Use connection pooling (already configured)
- Enable SSL in production

---

### 4. Environment Files

**Add to `.gitignore`:**
```
.env
.env.local
.env.development
.env.production
.env.test
```

**Never commit:**
- ❌ `.env` files
- ❌ AWS credentials
- ❌ Database passwords
- ❌ JWT secrets

---

## 🌍 Environment-Specific Configuration

### Development

```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DB_NAME=halloween_test_dev
JWT_EXPIRES_IN=24h
```

### Staging

```env
NODE_ENV=staging
FRONTEND_URL=https://staging.yourdomain.com
DB_NAME=halloween_test_staging
JWT_EXPIRES_IN=24h
```

### Production

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
DB_NAME=halloween_test_prod
JWT_EXPIRES_IN=7d
```

---

## 🧪 Testing Configuration

For running tests:

```env
NODE_ENV=test
DB_NAME=halloween_test_test
ENABLE_EMAIL_AUTH=false
```

---

## 📊 Configuration Validation

The backend validates configuration on startup:

```typescript
// Checks performed:
✓ ENABLE_EMAIL_AUTH is boolean
✓ PORT is valid number
✓ If ENABLE_EMAIL_AUTH=true:
  ✓ Database config is complete
  ✓ AWS config is complete
  ✓ JWT_SECRET is at least 32 characters
  ✓ AWS_ACCESS_KEY_ID starts with AKIA
```

**Startup logs:**
```
✓ Configuration validated
✓ Feature mode: Advanced (email authentication enabled)
✓ Database connected: halloween_test
✓ AWS SES configured: us-east-1
✓ Server running on port 3000
```

---

## 🚨 Common Configuration Errors

### Error: "JWT_SECRET must be at least 32 characters"

**Fix:**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env
JWT_SECRET=<generated-secret>
```

---

### Error: "Database connection failed"

**Check:**
1. PostgreSQL is running
2. Database exists: `createdb halloween_test`
3. Credentials are correct
4. Port is correct (default: 5432)

**Test connection:**
```bash
psql -h localhost -U postgres -d halloween_test
```

---

### Error: "AWS credentials not configured"

**Check:**
1. `AWS_ACCESS_KEY_ID` starts with `AKIA`
2. `AWS_SECRET_ACCESS_KEY` is complete
3. No quotes around values
4. No extra spaces

---

### Error: "Email address not verified"

**Fix:**
1. Go to AWS SES Console
2. Verify sender email
3. In Sandbox mode, verify recipient emails too

---

## 📋 Configuration Checklist

Before starting the backend:

- [ ] `.env` file created in `backend/` directory
- [ ] `ENABLE_EMAIL_AUTH` set to desired mode
- [ ] `PORT` configured (default: 3000)
- [ ] `FRONTEND_URL` matches frontend dev server
- [ ] If advanced mode:
  - [ ] Database configured and running
  - [ ] Database migrations run
  - [ ] AWS SES email verified
  - [ ] AWS credentials configured
  - [ ] JWT secret generated (32+ chars)
- [ ] `.env` added to `.gitignore`
- [ ] No sensitive data committed to git

---

## 🔗 Related Documentation

- [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md) - Complete AWS setup
- [AWS_QUICK_SETUP.md](./AWS_QUICK_SETUP.md) - Quick AWS reference
- [SETUP_AND_RUN.md](./SETUP_AND_RUN.md) - Full application setup

---

Your backend is now properly configured! 🎃⚙️✨
