# 🚀 AWS Setup Guide for Halloween Personality Test

This guide will help you configure AWS resources (specifically AWS SES for email) to enable the advanced mode with email authentication.

---

## 📋 Prerequisites

Before you begin, you'll need:
- An AWS account ([Sign up here](https://aws.amazon.com/))
- A verified email address or domain
- AWS CLI installed (optional but recommended)

---

## 🎯 Overview

The Halloween Personality Test uses **AWS SES (Simple Email Service)** to send:
1. **Verification emails** - Magic link for user authentication
2. **Result emails** - Test results sent to users (optional feature)

---

## 📝 Step-by-Step Setup

### Step 1: Create an AWS Account

1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add payment method (AWS Free Tier includes 62,000 emails/month for free!)

---

### Step 2: Set Up AWS SES

#### 2.1 Access SES Console

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Search for "SES" in the services search bar
3. Click on "Simple Email Service"
4. **Important:** Select your region (e.g., `us-east-1`) - remember this!

#### 2.2 Verify Your Email Address

**For Development/Testing:**

1. In SES Console, go to **"Verified identities"**
2. Click **"Create identity"**
3. Select **"Email address"**
4. Enter your email (e.g., `noreply@yourdomain.com`)
5. Click **"Create identity"**
6. Check your email inbox
7. Click the verification link in the email from AWS
8. Wait for status to change to **"Verified"**

**Example:**
```
From Email: noreply@yourdomain.com
Status: Verified ✓
```

#### 2.3 Verify Recipient Emails (Sandbox Mode)

By default, AWS SES is in **Sandbox mode**, which means:
- You can only send emails to verified addresses
- Limited to 200 emails per day
- 1 email per second

**To test in Sandbox:**
1. Verify your test email addresses (same process as above)
2. You can now send emails to these verified addresses

**To move to Production:**
1. In SES Console, click **"Account dashboard"**
2. Click **"Request production access"**
3. Fill out the form explaining your use case
4. Wait for AWS approval (usually 24-48 hours)

---

### Step 3: Create IAM User for SES

#### 3.1 Access IAM Console

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** in the left sidebar
3. Click **"Create user"**

#### 3.2 Configure User

1. **User name:** `halloween-test-ses-user`
2. **Access type:** Select "Access key - Programmatic access"
3. Click **"Next"**

#### 3.3 Set Permissions

1. Click **"Attach policies directly"**
2. Search for **"AmazonSESFullAccess"**
3. Check the box next to it
4. Click **"Next"**
5. Click **"Create user"**

#### 3.4 Save Credentials

**IMPORTANT:** You'll see your credentials only once!

```
Access Key ID: AKIA...
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**Save these immediately!** You'll need them for your `.env` file.

---

### Step 4: Configure Backend Environment

#### 4.1 Update `.env` File

Navigate to your backend directory and edit `.env`:

```bash
cd backend
```

Edit `.env` file:

```env
# Enable Advanced Mode
ENABLE_EMAIL_AUTH=true

# AWS SES Configuration
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Database Configuration (also required for advanced mode)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halloween_test
DB_USER=postgres
DB_PASSWORD=your-database-password

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=24h
```

#### 4.2 Generate JWT Secret

Use one of these methods:

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**OpenSSL:**
```bash
openssl rand -hex 32
```

**Online Generator:**
- Visit: https://randomkeygen.com/
- Use a "CodeIgniter Encryption Key" (256-bit)

---

### Step 5: Test Your Configuration

#### 5.1 Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3000
Feature mode: Advanced (email authentication enabled)
AWS SES configured for region: us-east-1
```

#### 5.2 Test Email Sending

**Option 1: Use the Frontend**
1. Start frontend: `cd frontend && npm run dev`
2. Go to http://localhost:5173
3. Click "Start Test"
4. Enter your verified email address
5. Check your inbox for verification email

**Option 2: Use curl**
```bash
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your-verified-email@example.com"}'
```

#### 5.3 Verify Email Received

Check your inbox for an email like:
```
From: noreply@yourdomain.com
Subject: 🎃 할로윈 성격 테스트 - 이메일 인증

[Email with verification button]
```

---

## 🔧 Configuration Reference

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ENABLE_EMAIL_AUTH` | Yes | Enable advanced mode | `true` |
| `AWS_REGION` | Yes | AWS region for SES | `us-east-1` |
| `AWS_SES_FROM_EMAIL` | Yes | Verified sender email | `noreply@yourdomain.com` |
| `AWS_ACCESS_KEY_ID` | Yes | IAM user access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Yes | IAM user secret key | `wJalrXUtnFEMI/...` |
| `FRONTEND_URL` | Yes | Frontend URL for links | `http://localhost:5173` |
| `JWT_SECRET` | Yes | JWT signing secret (32+ chars) | `abc123...` |
| `JWT_EXPIRES_IN` | No | JWT expiration time | `24h` |

### AWS Regions

Common AWS regions for SES:
- `us-east-1` - US East (N. Virginia) - **Recommended**
- `us-west-2` - US West (Oregon)
- `eu-west-1` - Europe (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

**Note:** Not all regions support SES. Check [AWS SES Regions](https://docs.aws.amazon.com/ses/latest/dg/regions.html)

---

## 🚨 Troubleshooting

### Issue: "Email not sending"

**Check:**
1. ✅ Email address is verified in SES Console
2. ✅ AWS credentials are correct in `.env`
3. ✅ AWS region matches SES configuration
4. ✅ IAM user has `AmazonSESFullAccess` permission
5. ✅ Backend is running with `ENABLE_EMAIL_AUTH=true`

**Test AWS credentials:**
```bash
# Install AWS CLI
# Windows: https://aws.amazon.com/cli/
# Mac: brew install awscli

# Configure credentials
aws configure

# Test SES
aws ses verify-email-identity --email-address test@example.com --region us-east-1
```

---

### Issue: "MessageRejected: Email address is not verified"

**Solution:**
- You're in Sandbox mode
- Verify the recipient email address in SES Console
- OR request production access

---

### Issue: "Invalid AWS credentials"

**Check:**
1. Access Key ID starts with `AKIA`
2. Secret Access Key is the full string (no spaces)
3. No quotes around values in `.env` file
4. IAM user has correct permissions

**Regenerate credentials:**
1. Go to IAM Console
2. Find your user
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Update `.env` with new credentials

---

### Issue: "Rate exceeded"

**Sandbox limits:**
- 200 emails per day
- 1 email per second

**Solution:**
- Request production access
- OR wait 24 hours for limit reset

---

## 💰 AWS Pricing

### SES Pricing (as of 2024)

**Free Tier:**
- 62,000 emails per month (when sending from EC2)
- 3,000 emails per month (when sending from other sources)

**After Free Tier:**
- $0.10 per 1,000 emails sent
- $0.12 per GB of attachments

**Example costs:**
- 10,000 emails/month: ~$1.00
- 100,000 emails/month: ~$10.00

**For this app:**
- Verification emails only (no attachments)
- Very low cost even with many users
- Free tier should cover most development/testing

---

## 🔒 Security Best Practices

### 1. Never Commit Credentials

**Add to `.gitignore`:**
```
.env
.env.local
.env.production
```

### 2. Use IAM Roles in Production

For production deployment (EC2, Lambda, etc.):
- Use IAM roles instead of access keys
- Attach `AmazonSESFullAccess` policy to role
- No need to store credentials in `.env`

### 3. Rotate Access Keys

- Rotate keys every 90 days
- Delete unused keys
- Use AWS Secrets Manager for production

### 4. Limit Permissions

Instead of `AmazonSESFullAccess`, create custom policy:

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

## 📧 Email Templates

The app includes two email templates:

### 1. Verification Email
- Subject: "🎃 할로윈 성격 테스트 - 이메일 인증"
- Contains magic link for authentication
- Link expires in 24 hours
- HTML and plain text versions

### 2. Result Email (Optional)
- Subject: "🎃 당신의 할로윈 캐릭터는 [Character]입니다!"
- Contains test result and character description
- Link to profile page
- HTML and plain text versions

**Customize templates:**
Edit `backend/src/services/implementations/SESEmailService.ts`

---

## 🧪 Testing Checklist

Before going live, test:

- [ ] Verification email sends successfully
- [ ] Verification link works and redirects correctly
- [ ] Email appears in inbox (not spam)
- [ ] HTML email renders correctly
- [ ] Plain text fallback works
- [ ] Links in email are clickable
- [ ] Email works on mobile devices
- [ ] Unverified emails are rejected (Sandbox mode)
- [ ] Rate limits are respected

---

## 🚀 Moving to Production

### 1. Request Production Access

1. Go to SES Console → Account dashboard
2. Click "Request production access"
3. Fill out form:
   - **Use case:** "Transactional emails for user authentication"
   - **Website URL:** Your production URL
   - **Describe:** "Sending verification emails for Halloween personality test app"
4. Submit and wait for approval (24-48 hours)

### 2. Verify Domain (Recommended)

Instead of individual emails, verify your domain:

1. SES Console → Verified identities
2. Create identity → Domain
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records (provided by AWS)
5. Wait for verification
6. Can now send from any `@yourdomain.com` address

### 3. Set Up DKIM

Improves email deliverability:

1. In verified identity settings
2. Enable DKIM
3. Add DKIM DNS records
4. Verify DKIM status

### 4. Monitor Sending

- Check SES Console → Reputation dashboard
- Monitor bounce and complaint rates
- Set up CloudWatch alarms
- Review sending statistics

---

## 📚 Additional Resources

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [AWS SES Pricing](https://aws.amazon.com/ses/pricing/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
- [Email Deliverability Guide](https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-deliverability.html)

---

## 🆘 Getting Help

If you encounter issues:

1. Check AWS SES Console for error messages
2. Review backend logs for detailed errors
3. Verify all environment variables are set
4. Test AWS credentials with AWS CLI
5. Check AWS Service Health Dashboard

---

## ✅ Quick Setup Checklist

- [ ] AWS account created
- [ ] SES service accessed in correct region
- [ ] Sender email verified in SES
- [ ] Test recipient emails verified (Sandbox mode)
- [ ] IAM user created with SES permissions
- [ ] Access keys generated and saved
- [ ] `.env` file configured with AWS credentials
- [ ] JWT secret generated
- [ ] Database configured (PostgreSQL)
- [ ] Backend started successfully
- [ ] Test email sent and received
- [ ] Verification link works

---

Your AWS SES is now configured and ready to send emails! 🎃📧✨

For production deployment, remember to request production access and verify your domain for better deliverability.
