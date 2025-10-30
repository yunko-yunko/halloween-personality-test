# ⚡ AWS Quick Setup - TL;DR

Quick reference for setting up AWS SES for the Halloween Personality Test.

---

## 🎯 What You Need

1. AWS Account
2. Verified email address
3. IAM credentials
4. 15 minutes

---

## 🚀 5-Minute Setup

### 1. AWS Console Setup

```
1. Go to AWS Console → SES
2. Select region (us-east-1 recommended)
3. Verified identities → Create identity
4. Verify your email (check inbox for link)
5. IAM → Users → Create user
6. Attach policy: AmazonSESFullAccess
7. Create access key → Save credentials
```

### 2. Backend Configuration

Edit `backend/.env`:

```env
ENABLE_EMAIL_AUTH=true

AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/...

FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=halloween_test
DB_USER=postgres
DB_PASSWORD=your-password

JWT_SECRET=your-32-char-secret-here
JWT_EXPIRES_IN=24h
```

### 3. Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start Backend

```bash
cd backend
npm run dev
```

### 5. Test

```bash
# Send test email
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your-verified-email@example.com"}'
```

---

## 📋 Checklist

- [ ] AWS account created
- [ ] Email verified in SES Console
- [ ] IAM user created with SES access
- [ ] Credentials saved
- [ ] `.env` configured
- [ ] JWT secret generated
- [ ] Database running
- [ ] Backend started
- [ ] Test email received

---

## 🚨 Common Issues

### Email not sending?
- ✅ Email verified in SES?
- ✅ Correct AWS region?
- ✅ Valid credentials in `.env`?
- ✅ `ENABLE_EMAIL_AUTH=true`?

### "Email not verified" error?
- You're in Sandbox mode
- Verify recipient email in SES Console
- OR request production access

### Invalid credentials?
- Check Access Key starts with `AKIA`
- No quotes in `.env` file
- No extra spaces

---

## 💰 Cost

**Free Tier:** 3,000 emails/month
**After:** $0.10 per 1,000 emails

For this app: **Essentially free** for development/testing

---

## 📚 Full Guide

See [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md) for detailed instructions.

---

## 🔗 Quick Links

- [AWS Console](https://console.aws.amazon.com/)
- [SES Console](https://console.aws.amazon.com/ses/)
- [IAM Console](https://console.aws.amazon.com/iam/)
- [AWS Free Tier](https://aws.amazon.com/free/)

---

That's it! Your AWS SES is ready to send emails! 🎃📧✨
