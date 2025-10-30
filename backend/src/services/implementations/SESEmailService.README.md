# SESEmailService Implementation

## Overview

The `SESEmailService` is an implementation of the `IEmailService` interface that uses AWS Simple Email Service (SES) to send emails. This service is used in advanced mode when `ENABLE_EMAIL_AUTH=true`.

## Features

- **Email Verification**: Sends verification emails with secure token links
- **Result Notifications**: Sends test result emails with character information
- **Korean Language Support**: All email content is in Korean with UTF-8 encoding
- **HTML & Plain Text**: Provides both HTML and plain text versions of emails
- **Error Handling**: Graceful error handling with user-friendly Korean error messages
- **Halloween Theme**: Emails styled with dark, spooky Halloween theme

## Configuration

### Environment Variables

The service requires the following environment variables:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SES_FROM_EMAIL=noreply@your-domain.com

# Frontend URL (for email links)
FRONTEND_URL=https://your-domain.com
```

### AWS SES Setup

1. **Verify Email Address**: In AWS SES console, verify the sender email address
2. **Sandbox Mode**: For testing, SES starts in sandbox mode (can only send to verified addresses)
3. **Production Mode**: Request production access to send to any email address
4. **IAM Permissions**: Ensure the AWS credentials have `ses:SendEmail` permission

## Usage

### Basic Usage

```typescript
import { SESEmailService } from './services/implementations/SESEmailService';

const emailService = new SESEmailService();

// Send verification email
await emailService.sendVerificationEmail('user@example.com', 'verification-token-123');

// Send result email
await emailService.sendResultEmail('user@example.com', 'zombie');
```

### With Dependency Injection

```typescript
import { IEmailService } from './services/interfaces/IEmailService';
import { SESEmailService } from './services/implementations/SESEmailService';

const emailService: IEmailService = new SESEmailService();
```

## Email Templates

### Verification Email

**Subject**: 🎃 할로윈 성격 테스트 - 이메일 인증

**Content**:
- Welcome message
- Verification button with link
- Fallback link for manual copy-paste
- 24-hour expiration notice
- Halloween-themed styling (dark background, orange/purple gradients)

**Link Format**: `{FRONTEND_URL}/auth/verify?token={token}`

### Result Email

**Subject**: 🎃 당신의 할로윈 캐릭터는 {캐릭터명}입니다!

**Content**:
- Character name announcement
- Character description
- Profile page link
- Encouragement to retake test
- Halloween-themed styling

**Link Format**: `{FRONTEND_URL}/profile`

## Supported Characters

The service includes Korean descriptions for all 8 Halloween characters:

1. **좀비 (Zombie)** - ESTJ/ESTP
2. **조커 (Joker)** - ENTJ/ENTP
3. **해골 (Skeleton)** - INFJ/INFP
4. **수녀 (Nun)** - ISFJ/ISFP
5. **잭오랜턴 (Jack-o'-lantern)** - ENFJ/ENFP
6. **뱀파이어 (Vampire)** - ISTJ/ISTP
7. **유령 (Ghost)** - ESFJ/ESFP
8. **프랑켄슈타인 (Frankenstein)** - INTJ/INTP

## Error Handling

### Verification Email Errors

```typescript
try {
  await emailService.sendVerificationEmail(email, token);
} catch (error) {
  // Error message: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요."
  console.error('Failed to send verification email:', error);
}
```

### Result Email Errors

```typescript
try {
  await emailService.sendResultEmail(email, character);
} catch (error) {
  // Error message: "결과 이메일 전송에 실패했습니다."
  console.error('Failed to send result email:', error);
}
```

## Testing

### Unit Tests

The service includes comprehensive unit tests covering:

- ✅ Verification email sending with correct parameters
- ✅ Verification link inclusion in email body
- ✅ Error handling for SES failures
- ✅ UTF-8 charset for Korean text
- ✅ Result emails for all 8 characters
- ✅ Profile link inclusion in result emails
- ✅ AWS configuration with environment variables
- ✅ Default values when environment variables are missing

### Running Tests

```bash
npm test -- SESEmailService.test.ts
```

### Testing with SES Sandbox

When testing in AWS SES sandbox mode:

1. Verify recipient email addresses in AWS SES console
2. Send test emails to verified addresses only
3. Check AWS SES sending statistics for delivery status
4. Monitor CloudWatch logs for any errors

## Email Design

### HTML Email Features

- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Black background (#0a0a0a, #1a1a1a)
- **Accent Colors**: Orange (#ff6b35) and purple (#6a0dad) gradients
- **Typography**: Noto Sans KR for Korean text
- **Buttons**: Gradient buttons with hover effects
- **Layout**: Centered 600px width table layout

### Plain Text Fallback

All emails include plain text versions for email clients that don't support HTML.

## Security Considerations

- **No Sensitive Data**: Emails don't contain passwords or sensitive information
- **Token Expiration**: Verification tokens expire after 24 hours
- **HTTPS Links**: Production links should use HTTPS
- **Rate Limiting**: Consider implementing rate limiting to prevent email spam

## Troubleshooting

### Common Issues

1. **Email Not Received**
   - Check AWS SES sending statistics
   - Verify sender email is verified in SES
   - Check spam/junk folder
   - Ensure SES is not in sandbox mode (or recipient is verified)

2. **SES Error: Email address not verified**
   - Verify sender email in AWS SES console
   - In sandbox mode, verify recipient emails too

3. **SES Error: Access Denied**
   - Check IAM permissions for `ses:SendEmail`
   - Verify AWS credentials are correct

4. **Korean Characters Not Displaying**
   - Ensure UTF-8 charset is set (already configured)
   - Check email client supports UTF-8

### Debugging

Enable detailed logging:

```typescript
// The service already logs success and errors
// Check console output for:
// - "Verification email sent successfully to {email}"
// - "Result email sent successfully to {email}"
// - "Failed to send verification email: {error}"
// - "Failed to send result email: {error}"
```

## Migration from AWS SDK v2 to v3

The current implementation uses AWS SDK v2. To migrate to v3:

```typescript
// Replace
import AWS from 'aws-sdk';

// With
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Update constructor
this.sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Update sendEmail calls
const command = new SendEmailCommand(params);
await this.sesClient.send(command);
```

## Related Files

- **Interface**: `src/services/interfaces/IEmailService.ts`
- **No-op Implementation**: `src/services/implementations/NoOpEmailService.ts`
- **Tests**: `src/services/implementations/__tests__/SESEmailService.test.ts`
- **Types**: `src/types/index.ts`

## Requirements Satisfied

This implementation satisfies the following requirements:

- ✅ **6.2**: Send verification email via email service interface
- ✅ **6.3**: Verification email contains unique verification link
- ✅ **7.3**: Send result via email using email service interface
- ✅ **10.1**: Use IEmailService interface
- ✅ **10.6**: Change email provider by changing implementation only
- ✅ **13.1**: Use AWS SES with proper configuration
- ✅ **17.3**: Display user-friendly error messages in Korean when AWS services fail
