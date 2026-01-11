import { NextRequest, NextResponse } from 'next/server';
import { createFinbyWebhookHandler, createFinbyV3WebhookHandler } from '@ryla/payments';
import { grantCredits, getCreditsForPlan } from '@ryla/payments';
import { createDrizzleDb, PaymentRepository } from '@ryla/data';
import { eq } from 'drizzle-orm';
import { subscriptions } from '@ryla/data';
import { PLAN_CREDITS } from '@ryla/shared';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Finby Recurring Payment Webhook Handler
 * 
 * Handles webhooks for recurring subscription payments.
 * Uses OriginalPaymentRequestId to link to initial payment.
 */

// Get database connection
function getDb() {
  const isLocal = (process.env['POSTGRES_ENVIRONMENT'] || process.env['NODE_ENV']) === 'local';
  return createDrizzleDb({
    host: process.env['POSTGRES_HOST'] || 'localhost',
    port: Number(process.env['POSTGRES_PORT']) || 5432,
    user: process.env['POSTGRES_USER'] || 'ryla',
    password: process.env['POSTGRES_PASSWORD'] || 'ryla_local_dev',
    database: process.env['POSTGRES_DB'] || 'ryla',
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

// Get credits for plan
function getCreditsForPlanId(planId: string): number {
  const plan = PLAN_CREDITS[planId as keyof typeof PLAN_CREDITS];
  if (plan) {
    return plan.monthlyCredits === Infinity ? 0 : plan.monthlyCredits;
  }
  return 0;
}

// Create API v3 recurring webhook handler
const v3Handler = createFinbyV3WebhookHandler({
  projectId: process.env.FINBY_PROJECT_ID || '',
  secretKey: process.env.FINBY_SECRET_KEY || '',
  onPaymentSucceeded: async (event) => {
    console.log('[Finby Recurring Webhook] Payment succeeded (v3):', event.data.invoiceId);

    const db = getDb();
    const paymentRepo = new PaymentRepository(db);

    // For recurring payments, we need to find the subscription by OriginalPaymentRequestId
    // In v3, this might be in the reference or metadata
    const rawData = event.raw as any;
    const originalPaymentRequestId = rawData?.data?.originalPaymentRequestId || 
                                     rawData?.data?.metadata?.originalPaymentRequestId ||
                                     rawData?.data?.reference ||
                                     (event.data as any).reference;

    if (!originalPaymentRequestId) {
      console.warn('[Finby Recurring Webhook] No OriginalPaymentRequestId found');
      return;
    }

    // Find subscription by original payment request ID
    const subscription = await paymentRepo.getSubscriptionByFinbyId(originalPaymentRequestId);
    if (!subscription) {
      console.warn(`[Finby Recurring Webhook] Subscription not found for OriginalPaymentRequestId: ${originalPaymentRequestId}`);
      return;
    }

    // Check if subscription is cancelled
    if (subscription.cancelAtPeriodEnd || subscription.status === 'cancelled') {
      console.log(`[Finby Recurring Webhook] Subscription ${subscription.id} is cancelled, skipping renewal`);
      return;
    }

    // Update subscription period
    const now = new Date();
    const currentPeriodStart = subscription.currentPeriodEnd || now;
    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    await paymentRepo.updateSubscription(subscription.id, {
      currentPeriodStart,
      currentPeriodEnd,
      status: 'active',
      updatedAt: now,
    });

    console.log(`[Finby Recurring Webhook] Updated subscription ${subscription.id} period to ${currentPeriodEnd.toISOString()}`);

    // Grant monthly credits
    if (subscription.tier) {
      const credits = getCreditsForPlanId(subscription.tier);
      if (credits > 0) {
        await grantCredits(db, {
          userId: subscription.userId,
          amount: credits,
          type: 'subscription_grant',
          description: `Monthly subscription credits renewal (${subscription.tier})`,
          referenceType: 'subscription_renewal',
          referenceId: originalPaymentRequestId,
        });
        
        console.log(`[Finby Recurring Webhook] Granted ${credits} credits for subscription renewal`);
      }
    }
  },
  onPaymentFailed: async (event) => {
    console.error('[Finby Recurring Webhook] Payment failed (v3):', event.data.error);
    
    const db = getDb();
    const paymentRepo = new PaymentRepository(db);
    
    // Find subscription and update status to past_due
    const rawData = event.raw as any;
    const originalPaymentRequestId = rawData?.data?.originalPaymentRequestId || 
                                     rawData?.data?.metadata?.originalPaymentRequestId;
    
    if (originalPaymentRequestId) {
      const subscription = await paymentRepo.getSubscriptionByFinbyId(originalPaymentRequestId);
      if (subscription) {
        await paymentRepo.updateSubscription(subscription.id, {
          status: 'past_due',
          updatedAt: new Date(),
        });
        console.log(`[Finby Recurring Webhook] Updated subscription ${subscription.id} to past_due`);
      }
    }
  },
  onError: (error, rawBody) => {
    console.error('[Finby Recurring Webhook] v3 Handler error:', error);
    console.error('[Finby Recurring Webhook] Raw body:', rawBody);
  },
});

// Legacy v1 handler
const v1Handler = process.env.FINBY_API_KEY && process.env.FINBY_MERCHANT_ID
  ? createFinbyWebhookHandler({
    apiKey: process.env.FINBY_API_KEY,
    merchantId: process.env.FINBY_MERCHANT_ID,
    webhookSecret: process.env.FINBY_WEBHOOK_SECRET,
    onPaymentSucceeded: async (event) => {
      console.log('[Finby Recurring Webhook] Payment succeeded (v1):', event.data.invoiceId);

      const db = getDb();
      const paymentRepo = new PaymentRepository(db);

      // Get OriginalPaymentRequestId from webhook
      const rawData = event.raw as any;
      const originalPaymentRequestId = rawData?.data?.originalPaymentRequestId ||
                                       rawData?.data?.PaymentInformation?.References?.OriginalPaymentRequestId;

      if (!originalPaymentRequestId) {
        console.warn('[Finby Recurring Webhook] No OriginalPaymentRequestId found');
        return;
      }

      // Find subscription by original payment request ID
      const subscription = await paymentRepo.getSubscriptionByFinbyId(originalPaymentRequestId);
      if (!subscription) {
        console.warn(`[Finby Recurring Webhook] Subscription not found for OriginalPaymentRequestId: ${originalPaymentRequestId}`);
        return;
      }

      // Update subscription period
      const now = new Date();
      const currentPeriodStart = subscription.currentPeriodEnd || now;
      const currentPeriodEnd = event.data.currentPeriodEnd || new Date(currentPeriodStart);
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      await paymentRepo.updateSubscription(subscription.id, {
        currentPeriodStart,
        currentPeriodEnd,
        status: 'active',
        updatedAt: now,
      });

      // Grant monthly credits
      if (subscription.tier) {
        const credits = getCreditsForPlanId(subscription.tier);
        if (credits > 0) {
          await grantCredits(db, {
            userId: subscription.userId,
            amount: credits,
            type: 'subscription_grant',
            description: `Monthly subscription credits renewal (${subscription.tier})`,
            referenceType: 'subscription_renewal',
            referenceId: originalPaymentRequestId,
          });
          
          console.log(`[Finby Recurring Webhook] Granted ${credits} credits for subscription renewal`);
        }
      }
    },
    onPaymentFailed: async (event) => {
      console.error('[Finby Recurring Webhook] Payment failed (v1):', event.data.error);
      
      const db = getDb();
      const paymentRepo = new PaymentRepository(db);
      
      const rawData = event.raw as any;
      const originalPaymentRequestId = rawData?.data?.originalPaymentRequestId ||
                                       rawData?.data?.PaymentInformation?.References?.OriginalPaymentRequestId;
      
      if (originalPaymentRequestId) {
        const subscription = await paymentRepo.getSubscriptionByFinbyId(originalPaymentRequestId);
        if (subscription) {
          await paymentRepo.updateSubscription(subscription.id, {
            status: 'past_due',
            updatedAt: new Date(),
          });
        }
      }
    },
    onError: (error, rawBody) => {
      console.error('[Finby Recurring Webhook] v1 Handler error:', error);
      console.error('[Finby Recurring Webhook] Raw body:', rawBody);
    },
  })
  : null;

/**
 * Handle recurring payment webhook requests
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const url = new URL(request.url);

    // API v3 uses query parameter signature
    const v3Signature = url.searchParams.get('Signature') || '';
    const v1Signature = request.headers.get('x-finby-signature') || '';

    // Route based on available signature
    if (v3Signature && process.env.FINBY_PROJECT_ID && process.env.FINBY_SECRET_KEY) {
      console.log('[Finby Recurring Webhook] Routing to v3 handler');
      return await v3Handler(rawBody, v3Signature);
    }

    if (v1Signature && v1Handler) {
      console.log('[Finby Recurring Webhook] Routing to v1 handler');
      return await v1Handler(rawBody, v1Signature);
    }

    // Default: try v3 if configured
    if (process.env.FINBY_PROJECT_ID && process.env.FINBY_SECRET_KEY) {
      console.log('[Finby Recurring Webhook] Trying v3 handler as default');
      return await v3Handler(rawBody, v3Signature);
    }

    // No handlers configured
    console.error('[Finby Recurring Webhook] No suitable handler found');
    return NextResponse.json(
      { error: 'Recurring webhook handlers not configured' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('[Finby Recurring Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Finby may also send notifications via GET
export async function GET(request: NextRequest) {
  return POST(request);
}

