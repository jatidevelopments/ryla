#!/usr/bin/env tsx
/**
 * Test script to send all email templates to a test email address
 * 
 * Usage:
 *   tsx scripts/test-email-templates.ts
 * 
 * Make sure RESEND_API_KEY is set in your .env.local or .env file.
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local or .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Ensure React is available for JSX rendering
import React from 'react';
(global as any).React = React;

import {
  sendEmail,
  WelcomeEmail,
  VerificationEmail,
  PasswordResetEmail,
  SubscriptionConfirmationEmail,
  SubscriptionCancelledEmail,
  GenerationCompleteEmail,
} from '@ryla/email';

const TEST_EMAIL = 'janistirtey1@gmail.com';

// Use Resend's default domain for testing if ryla.ai is not verified
// You can override this by setting EMAIL_FROM in your .env
const TEST_FROM = process.env['EMAIL_FROM'] || 'onboarding@resend.dev';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testAllEmails() {
  console.log('📧 Testing all email templates...\n');
  console.log(`Sending to: ${TEST_EMAIL}`);
  console.log(`From: ${TEST_FROM}\n`);

  const results: Array<{ name: string; success: boolean; error?: string }> = [];

  // 1. Welcome Email
  try {
    console.log('1️⃣  Sending Welcome Email...');
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: '[TEST] Welcome to RYLA!',
      template: WelcomeEmail,
      props: {
        userName: 'Test User',
        loginUrl: 'https://app.ryla.ai',
      },
    });
    console.log(`   ✅ Sent! Message ID: ${result.messageId}\n`);
    results.push({ name: 'Welcome Email', success: true });
    await sleep(1000); // Rate limit: 2 requests per second
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    results.push({ name: 'Welcome Email', success: false, error: error.message });
    await sleep(1000);
  }

  // 2. Verification Email
  try {
    console.log('2️⃣  Sending Verification Email...');
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: '[TEST] Sign in to RYLA',
      template: VerificationEmail,
      props: {
        verificationUrl: 'https://app.ryla.ai/verify?token=test_token_abc123',
        expiresIn: '24 hours',
      },
    });
    console.log(`   ✅ Sent! Message ID: ${result.messageId}\n`);
    results.push({ name: 'Verification Email', success: true });
    await sleep(1000);
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    results.push({ name: 'Verification Email', success: false, error: error.message });
    await sleep(1000);
  }

  // 3. Password Reset Email
  try {
    console.log('3️⃣  Sending Password Reset Email...');
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: '[TEST] Reset your RYLA password',
      template: PasswordResetEmail,
      props: {
        resetUrl: 'https://app.ryla.ai/reset-password?token=test_reset_token_xyz789',
        userName: 'Test User',
        expiresIn: '1 hour',
      },
    });
    console.log(`   ✅ Sent! Message ID: ${result.messageId}\n`);
    results.push({ name: 'Password Reset Email', success: true });
    await sleep(1000);
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    results.push({ name: 'Password Reset Email', success: false, error: error.message });
    await sleep(1000);
  }

  // 4. Subscription Confirmation Email
  try {
    console.log('4️⃣  Sending Subscription Confirmation Email...');
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: '[TEST] You\'re on Pro',
      template: SubscriptionConfirmationEmail,
      props: {
        userName: 'Test User',
        planName: 'Pro',
        amount: '$29',
        interval: 'month',
        nextBillingDate: nextBillingDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        dashboardUrl: 'https://app.ryla.ai/settings/billing',
      },
    });
    console.log(`   ✅ Sent! Message ID: ${result.messageId}\n`);
    results.push({ name: 'Subscription Confirmation Email', success: true });
    await sleep(1000);
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    results.push({ name: 'Subscription Confirmation Email', success: false, error: error.message });
    await sleep(1000);
  }

  // 5. Subscription Cancelled Email
  try {
    console.log('5️⃣  Sending Subscription Cancelled Email...');
    const accessEndsDate = new Date();
    accessEndsDate.setMonth(accessEndsDate.getMonth() + 1);
    
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: '[TEST] Subscription Cancelled',
      template: SubscriptionCancelledEmail,
      props: {
        userName: 'Test User',
        planName: 'Pro',
        accessEndsDate: accessEndsDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        resubscribeUrl: 'https://ryla.ai/#pricing',
      },
    });
    console.log(`   ✅ Sent! Message ID: ${result.messageId}\n`);
    results.push({ name: 'Subscription Cancelled Email', success: true });
    await sleep(1000);
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    results.push({ name: 'Subscription Cancelled Email', success: false, error: error.message });
    await sleep(1000);
  }

  // 6. Generation Complete Email
  try {
    console.log('6️⃣  Sending Generation Complete Email...');
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: '[TEST] Your character Luna is ready! 🎉',
      template: GenerationCompleteEmail,
      props: {
        userName: 'Test User',
        characterName: 'Luna',
        imageCount: 5,
        previewImageUrl: 'https://placehold.co/320x320/18181b/fafafa?text=Luna',
        viewUrl: 'https://app.ryla.ai/characters/123/images',
      },
    });
    console.log(`   ✅ Sent! Message ID: ${result.messageId}\n`);
    results.push({ name: 'Generation Complete Email', success: true });
    await sleep(1000);
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    results.push({ name: 'Generation Complete Email', success: false, error: error.message });
    await sleep(1000);
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary\n');
  
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n✅ Successful: ${successful}/${results.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${results.length}`);
  }

  console.log(`\n📬 Check your inbox at: ${TEST_EMAIL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run the test
testAllEmails().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

