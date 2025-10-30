/**
 * Example usage of SESEmailService
 * 
 * This file demonstrates how to use the SESEmailService in your application.
 * DO NOT run this file directly in production - it's for reference only.
 */

import { SESEmailService } from './SESEmailService';
import { HalloweenCharacter } from '../../types';

/**
 * Example 1: Send verification email
 */
async function exampleSendVerificationEmail() {
  const emailService = new SESEmailService();
  
  try {
    const userEmail = 'user@example.com';
    const verificationToken = 'abc123-verification-token-xyz789';
    
    await emailService.sendVerificationEmail(userEmail, verificationToken);
    
    console.log('✅ Verification email sent successfully!');
    console.log(`📧 Sent to: ${userEmail}`);
    console.log(`🔗 Token: ${verificationToken}`);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
  }
}

/**
 * Example 2: Send result email for each character
 */
async function exampleSendResultEmails() {
  const emailService = new SESEmailService();
  const userEmail = 'user@example.com';
  
  const characters: HalloweenCharacter[] = [
    'zombie',
    'joker',
    'skeleton',
    'nun',
    'jack-o-lantern',
    'vampire',
    'ghost',
    'frankenstein',
  ];
  
  for (const character of characters) {
    try {
      await emailService.sendResultEmail(userEmail, character);
      console.log(`✅ Result email sent for character: ${character}`);
    } catch (error) {
      console.error(`❌ Failed to send result email for ${character}:`, error);
    }
  }
}

/**
 * Example 3: Using with dependency injection
 */
import { IEmailService } from '../interfaces/IEmailService';

class AuthService {
  constructor(private emailService: IEmailService) {}
  
  async sendVerification(email: string, token: string): Promise<void> {
    // Business logic here...
    
    // Send email using injected service
    await this.emailService.sendVerificationEmail(email, token);
    
    console.log('Verification email sent via AuthService');
  }
}

async function exampleWithDependencyInjection() {
  const emailService: IEmailService = new SESEmailService();
  const authService = new AuthService(emailService);
  
  try {
    await authService.sendVerification('user@example.com', 'token-123');
    console.log('✅ Email sent via dependency injection');
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

/**
 * Example 4: Error handling
 */
async function exampleErrorHandling() {
  const emailService = new SESEmailService();
  
  try {
    // This will fail if AWS credentials are not configured
    await emailService.sendVerificationEmail('invalid-email', 'token');
  } catch (error) {
    // Error will be in Korean
    console.error('Error message:', (error as Error).message);
    // Expected: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요."
  }
}

/**
 * Example 5: Testing with SES Sandbox
 * 
 * When testing in AWS SES sandbox mode:
 * 1. Verify your sender email in AWS SES console
 * 2. Verify recipient emails you want to test with
 * 3. Run this example with verified emails
 */
async function exampleSandboxTesting() {
  const emailService = new SESEmailService();
  
  // Replace with your verified email addresses
  const verifiedEmail = 'your-verified-email@example.com';
  
  console.log('🧪 Testing in SES Sandbox mode...');
  console.log('📧 Make sure this email is verified in AWS SES console');
  
  try {
    await emailService.sendVerificationEmail(verifiedEmail, 'test-token-123');
    console.log('✅ Test email sent successfully!');
    console.log('📬 Check your inbox (and spam folder)');
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('💡 Troubleshooting:');
    console.log('   1. Check AWS credentials in .env file');
    console.log('   2. Verify sender email in AWS SES console');
    console.log('   3. Verify recipient email in AWS SES console (sandbox mode)');
    console.log('   4. Check AWS region is correct');
  }
}

/**
 * Example 6: Environment configuration check
 */
function exampleCheckConfiguration() {
  console.log('🔍 Checking AWS SES configuration...\n');
  
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SES_FROM_EMAIL',
    'FRONTEND_URL',
  ];
  
  let allConfigured = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const display = value ? (varName.includes('SECRET') ? '***' : value) : 'NOT SET';
    
    console.log(`${status} ${varName}: ${display}`);
    
    if (!value) {
      allConfigured = false;
    }
  }
  
  console.log('\n' + (allConfigured ? '✅ All required variables are set!' : '❌ Some variables are missing!'));
  
  if (!allConfigured) {
    console.log('\n💡 Add missing variables to your .env file:');
    console.log('   See backend/.env.example for reference');
  }
}

// Uncomment to run examples (make sure AWS credentials are configured first!)
// exampleCheckConfiguration();
// exampleSendVerificationEmail();
// exampleSendResultEmails();
// exampleWithDependencyInjection();
// exampleErrorHandling();
// exampleSandboxTesting();

export {
  exampleSendVerificationEmail,
  exampleSendResultEmails,
  exampleWithDependencyInjection,
  exampleErrorHandling,
  exampleSandboxTesting,
  exampleCheckConfiguration,
};
