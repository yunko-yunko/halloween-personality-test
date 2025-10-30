#!/usr/bin/env ts-node
/**
 * Test script for SESEmailService
 * 
 * This script helps verify that AWS SES is configured correctly
 * and can send emails successfully.
 * 
 * Usage:
 *   ts-node scripts/test-ses-email.ts
 * 
 * Prerequisites:
 *   1. Configure AWS credentials in .env file
 *   2. Verify sender email in AWS SES console
 *   3. In sandbox mode, verify recipient email too
 */

import dotenv from 'dotenv';
import { SESEmailService } from '../src/services/implementations/SESEmailService';
import { HalloweenCharacter } from '../src/types';

// Load environment variables
dotenv.config();

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkConfiguration(): boolean {
  log('\n🔍 Checking AWS SES Configuration...', colors.cyan);
  
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
    
    log(`${status} ${varName}: ${display}`);
    
    if (!value) {
      allConfigured = false;
    }
  }
  
  if (!allConfigured) {
    log('\n❌ Configuration incomplete!', colors.red);
    log('💡 Add missing variables to your .env file', colors.yellow);
    log('   See backend/.env.example for reference', colors.yellow);
    return false;
  }
  
  log('\n✅ Configuration looks good!', colors.green);
  return true;
}

async function testVerificationEmail(email: string) {
  log('\n📧 Testing Verification Email...', colors.cyan);
  
  const emailService = new SESEmailService();
  const testToken = 'test-token-' + Date.now();
  
  try {
    await emailService.sendVerificationEmail(email, testToken);
    log('✅ Verification email sent successfully!', colors.green);
    log(`   Recipient: ${email}`, colors.blue);
    log(`   Token: ${testToken}`, colors.blue);
    log('   📬 Check your inbox (and spam folder)', colors.yellow);
    return true;
  } catch (error) {
    log('❌ Failed to send verification email', colors.red);
    log(`   Error: ${(error as Error).message}`, colors.red);
    return false;
  }
}

async function testResultEmail(email: string, character: HalloweenCharacter) {
  log(`\n📧 Testing Result Email (${character})...`, colors.cyan);
  
  const emailService = new SESEmailService();
  
  try {
    await emailService.sendResultEmail(email, character);
    log(`✅ Result email sent successfully!`, colors.green);
    log(`   Recipient: ${email}`, colors.blue);
    log(`   Character: ${character}`, colors.blue);
    log('   📬 Check your inbox (and spam folder)', colors.yellow);
    return true;
  } catch (error) {
    log(`❌ Failed to send result email`, colors.red);
    log(`   Error: ${(error as Error).message}`, colors.red);
    return false;
  }
}

async function main() {
  log('🎃 Halloween Personality Test - SES Email Test', colors.cyan);
  log('='.repeat(50), colors.cyan);
  
  // Check configuration
  if (!checkConfiguration()) {
    process.exit(1);
  }
  
  // Get test email from command line or use default
  const testEmail = process.argv[2] || process.env.AWS_SES_FROM_EMAIL || 'test@example.com';
  
  log(`\n🎯 Test email address: ${testEmail}`, colors.blue);
  log('💡 In SES sandbox mode, this email must be verified', colors.yellow);
  log('   To test with a different email, run:', colors.yellow);
  log(`   ts-node scripts/test-ses-email.ts your-email@example.com`, colors.yellow);
  
  // Prompt for confirmation
  log('\n⚠️  This will send real emails via AWS SES', colors.yellow);
  log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...', colors.yellow);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test verification email
  const verificationSuccess = await testVerificationEmail(testEmail);
  
  // Wait a bit between emails
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test result email (pick a random character)
  const characters: HalloweenCharacter[] = ['zombie', 'joker', 'skeleton', 'vampire'];
  const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
  const resultSuccess = await testResultEmail(testEmail, randomCharacter);
  
  // Summary
  log('\n' + '='.repeat(50), colors.cyan);
  log('📊 Test Summary:', colors.cyan);
  log(`   Verification Email: ${verificationSuccess ? '✅ PASS' : '❌ FAIL'}`, 
      verificationSuccess ? colors.green : colors.red);
  log(`   Result Email: ${resultSuccess ? '✅ PASS' : '❌ FAIL'}`, 
      resultSuccess ? colors.green : colors.red);
  
  if (verificationSuccess && resultSuccess) {
    log('\n🎉 All tests passed!', colors.green);
    log('   Your AWS SES configuration is working correctly.', colors.green);
  } else {
    log('\n⚠️  Some tests failed', colors.yellow);
    log('   Troubleshooting tips:', colors.yellow);
    log('   1. Check AWS credentials are correct', colors.yellow);
    log('   2. Verify sender email in AWS SES console', colors.yellow);
    log('   3. In sandbox mode, verify recipient email too', colors.yellow);
    log('   4. Check AWS region matches your SES setup', colors.yellow);
    log('   5. Review CloudWatch logs for detailed errors', colors.yellow);
  }
  
  log('');
}

// Run the test
main().catch(error => {
  log(`\n💥 Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
