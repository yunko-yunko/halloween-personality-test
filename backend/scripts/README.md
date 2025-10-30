# Backend Scripts

This directory contains utility scripts for testing and managing the Halloween Personality Test backend.

## Available Scripts

### test-ses-email.ts

Test script for verifying AWS SES email configuration and functionality.

#### Purpose
- Verify AWS SES is configured correctly
- Test verification email sending
- Test result email sending
- Validate environment variables

#### Prerequisites

1. **Configure AWS credentials** in `.env` file:
   ```bash
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_SES_FROM_EMAIL=noreply@your-domain.com
   FRONTEND_URL=http://localhost:5173
   ```

2. **Verify sender email** in AWS SES console:
   - Go to AWS SES console
   - Navigate to "Verified identities"
   - Add and verify your sender email address

3. **For sandbox mode testing**, also verify recipient email:
   - In AWS SES console, verify the email you'll send test emails to
   - Or request production access to send to any email

#### Usage

**Basic usage** (sends to sender email):
```bash
cd backend
npx ts-node scripts/test-ses-email.ts
```

**Specify recipient email**:
```bash
npx ts-node scripts/test-ses-email.ts your-email@example.com
```

#### What It Does

1. **Configuration Check**
   - Validates all required environment variables are set
   - Shows which variables are configured (masks secrets)

2. **Verification Email Test**
   - Sends a test verification email
   - Includes a test token
   - Uses Korean language template
   - Shows success/failure status

3. **Result Email Test**
   - Sends a test result email
   - Uses a random Halloween character
   - Uses Korean language template
   - Shows success/failure status

4. **Summary Report**
   - Shows which tests passed/failed
   - Provides troubleshooting tips if needed

#### Example Output

```
🎃 Halloween Personality Test - SES Email Test
==================================================

🔍 Checking AWS SES Configuration...
✅ AWS_REGION: us-east-1
✅ AWS_ACCESS_KEY_ID: ***
✅ AWS_SECRET_ACCESS_KEY: ***
✅ AWS_SES_FROM_EMAIL: noreply@example.com
✅ FRONTEND_URL: http://localhost:5173

✅ Configuration looks good!

🎯 Test email address: test@example.com
💡 In SES sandbox mode, this email must be verified

⚠️  This will send real emails via AWS SES
   Press Ctrl+C to cancel, or wait 3 seconds to continue...

📧 Testing Verification Email...
✅ Verification email sent successfully!
   Recipient: test@example.com
   Token: test-token-1234567890
   📬 Check your inbox (and spam folder)

📧 Testing Result Email (zombie)...
✅ Result email sent successfully!
   Recipient: test@example.com
   Character: zombie
   📬 Check your inbox (and spam folder)

==================================================
📊 Test Summary:
   Verification Email: ✅ PASS
   Result Email: ✅ PASS

🎉 All tests passed!
   Your AWS SES configuration is working correctly.
```

#### Troubleshooting

**Error: "Configuration incomplete"**
- Check that all required environment variables are set in `.env`
- Copy from `.env.example` if needed

**Error: "Email address not verified"**
- Verify sender email in AWS SES console
- In sandbox mode, verify recipient email too

**Error: "Access Denied"**
- Check IAM permissions include `ses:SendEmail`
- Verify AWS credentials are correct

**Error: "이메일 전송에 실패했습니다"**
- Check AWS region matches your SES setup
- Verify AWS credentials are valid
- Check CloudWatch logs for detailed errors
- Ensure SES service is available in your region

**Emails not received**
- Check spam/junk folder
- Verify email address is correct
- Check AWS SES sending statistics
- In sandbox mode, ensure recipient is verified

#### AWS SES Sandbox Mode

By default, AWS SES accounts start in sandbox mode with these limitations:
- Can only send to verified email addresses
- Limited sending quota (200 emails/day)
- Limited sending rate (1 email/second)

To send to any email address:
1. Go to AWS SES console
2. Request production access
3. Provide use case details
4. Wait for approval (usually 24 hours)

#### Cost Considerations

AWS SES pricing (as of 2024):
- First 62,000 emails/month: $0.10 per 1,000 emails
- Additional emails: $0.10 per 1,000 emails
- No monthly fees

Testing with this script will incur minimal costs (< $0.01 per test run).

#### Related Files

- **Implementation**: `../src/services/implementations/SESEmailService.ts`
- **Tests**: `../src/services/implementations/__tests__/SESEmailService.test.ts`
- **Documentation**: `../src/services/implementations/SESEmailService.README.md`
- **Examples**: `../src/services/implementations/SESEmailService.example.ts`

## Adding New Scripts

When adding new scripts to this directory:

1. Use TypeScript for type safety
2. Add shebang line: `#!/usr/bin/env ts-node`
3. Include usage documentation in this README
4. Add error handling and user-friendly output
5. Use colors for better readability
6. Provide troubleshooting tips

## Running Scripts

All scripts can be run using `ts-node`:

```bash
npx ts-node scripts/script-name.ts [arguments]
```

Or make them executable:

```bash
chmod +x scripts/script-name.ts
./scripts/script-name.ts [arguments]
```
