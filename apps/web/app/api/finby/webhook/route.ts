import { NextRequest, NextResponse } from 'next/server';
import { createFinbyWebhookHandler, createFinbyV3WebhookHandler } from '@ryla/payments';
import { grantCredits, grantSubscriptionCredits } from '@ryla/payments';
import { createDrizzleDb } from '@ryla/data';
import { eq } from 'drizzle-orm';
import { subscriptions } from '@ryla/data';
import { parsePaymentReference } from '../../../../lib/utils/payment-reference';
import { PLAN_CREDITS, CREDIT_PACKAGES } from '@ryla/shared';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Finby Webhook Handler
 * 
 * Handles webhooks from both Finby API v1 (subscriptions) and API v3 (one-time payments).
 * Processes payment events and grants credits/activates subscriptions.
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

// Get credits for plan (using shared constants)
function getCreditsForPlanId(planId: string): number {
  const plan = PLAN_CREDITS[planId as keyof typeof PLAN_CREDITS];
  if (plan) {
    return plan.monthlyCredits === Infinity ? 0 : plan.monthlyCredits;
  }
  return 0;
}

// Helper to create or update subscription
async function createOrUpdateSubscription(
  db: ReturnType<typeof getDb>,
  userId: string,
  planId: string,
  finbySubscriptionId: string,
  periodEnd?: Date
) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  const credits = getCreditsForPlanId(planId);
  
  // Calculate period end (30 days from now for monthly, 365 for yearly)
  // For v3, we don't get period info, so we calculate it
  const now = new Date();
  const calculatedPeriodEnd = periodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        finbySubscriptionId,
        tier: planId as any,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: calculatedPeriodEnd,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        updatedAt: now,
      })
      .where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({
      userId,
      finbySubscriptionId,
      tier: planId as any,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: calculatedPeriodEnd,
    });
  }

  // Grant monthly credits
  if (credits > 0) {
    await grantSubscriptionCredits(db, userId, planId, finbySubscriptionId);
    console.log(`[Finby Webhook] Granted ${credits} credits to user ${userId} for plan ${planId}`);
  }
}

// Note: We're using API v3 for everything since user only has v3 credentials
// Subscriptions are handled as one-time monthly payments

// Create API v3 webhook handler (handles both one-time payments and subscriptions)
const v3Handler = createFinbyV3WebhookHandler({
  projectId: process.env.FINBY_PROJECT_ID || '',
  secretKey: process.env.FINBY_SECRET_KEY || '',
  onPaymentSucceeded: async (event) => {
    console.log('[Finby Webhook] Payment succeeded (v3):', event.data.invoiceId);
    
    const db = getDb();
    const reference = event.data.subscriptionId; // In v3, subscriptionId is actually the reference
    const parsed = parsePaymentReference(reference);

    if (!parsed) {
      console.warn('[Finby Webhook] Invalid payment reference:', reference);
      return;
    }

    if (parsed.type === 'subscription') {
      // Handle subscription payment (one-time monthly payment via v3)
      const { userId, planId } = parsed;
      
      try {
        // Create or update subscription record
        await createOrUpdateSubscription(
          db,
          userId,
          planId,
          event.data.invoiceId, // Use invoice ID as subscription ID for v3
          undefined // Period end will be calculated (30 days from now)
        );
        
        console.log(`[Finby Webhook] Subscription activated for user ${userId}, plan ${planId}`);
      } catch (error) {
        console.error('[Finby Webhook] Error processing subscription payment:', error);
        throw error;
      }
    } else if (parsed.type === 'credit') {
      // Handle credit purchase
      const { userId, packageId } = parsed;

      try {
        // Find credit package
        const package_ = CREDIT_PACKAGES.find(p => p.id === packageId);
        if (!package_) {
          console.error(`[Finby Webhook] Credit package not found: ${packageId}`);
          return;
        }

        // Grant credits
        await grantCredits(db, {
          userId,
          amount: package_.credits,
          type: 'purchase',
          description: `Purchased ${package_.credits} credits (${packageId})`,
          referenceType: 'credit_purchase',
          referenceId: event.data.invoiceId,
        });

        console.log(`[Finby Webhook] Granted ${package_.credits} credits to user ${userId} for package ${packageId}`);
      } catch (error) {
        console.error('[Finby Webhook] Error processing credit purchase:', error);
        throw error;
      }
    }
  },
  onPaymentFailed: async (event) => {
    console.error('[Finby Webhook] Payment failed (v3):', event.data.error);
  },
  onError: (error, rawBody) => {
    console.error('[Finby Webhook] v3 Handler error:', error);
    console.error('[Finby Webhook] Raw body:', rawBody);
  },
});

// Legacy v1 handler (not used if user only has v3, but kept for compatibility)
const v1Handler = process.env.FINBY_API_KEY && process.env.FINBY_MERCHANT_ID 
  ? createFinbyWebhookHandler({
      apiKey: process.env.FINBY_API_KEY,
      merchantId: process.env.FINBY_MERCHANT_ID,
      webhookSecret: process.env.FINBY_WEBHOOK_SECRET,
      onSubscriptionCreated: async (event) => {
    console.log('[Finby Webhook] Subscription created:', event.data.subscriptionId);
    
    const db = getDb();
    const reference = event.data.subscriptionId;
    const parsed = parsePaymentReference(reference);
    
    if (!parsed || parsed.type !== 'subscription') {
      console.warn('[Finby Webhook] Invalid subscription reference:', reference);
      return;
    }

    const { userId, planId } = parsed;

    try {
      await createOrUpdateSubscription(
        db,
        userId,
        planId,
        event.data.subscriptionId,
        event.data.currentPeriodEnd
      );
    } catch (error) {
      console.error('[Finby Webhook] Error processing subscription created:', error);
      throw error;
    }
  },
  onPaymentSucceeded: async (event) => {
    console.log('[Finby Webhook] Payment succeeded:', event.data.invoiceId);
    
    const db = getDb();
    const reference = event.data.subscriptionId;
    const parsed = parsePaymentReference(reference);

    if (!parsed) {
      console.warn('[Finby Webhook] Invalid payment reference:', reference);
      return;
    }

    if (parsed.type === 'subscription') {
      // Subscription renewal - grant credits
      const { userId, planId } = parsed;
      const credits = getCreditsForPlanId(planId);

      if (credits > 0) {
        await grantCredits(db, {
          userId,
          amount: credits,
          type: 'subscription_grant',
          description: `Monthly subscription credits renewal (${planId})`,
          referenceType: 'subscription_renewal',
          referenceId: event.data.subscriptionId,
        });
        console.log(`[Finby Webhook] Granted ${credits} credits for subscription renewal`);
      }

      // Update subscription period
      await db
        .update(subscriptions)
        .set({
          currentPeriodStart: new Date(),
          currentPeriodEnd: event.data.currentPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.finbySubscriptionId, event.data.subscriptionId));
    }
  },
  onPaymentFailed: async (event) => {
    console.error('[Finby Webhook] Payment failed:', event.data.error);
    // Could update subscription status to past_due here
  },
  onError: (error, rawBody) => {
    console.error('[Finby Webhook] v1 Handler error:', error);
    console.error('[Finby Webhook] Raw body:', rawBody);
  },
  })
  : null;


/**
 * Handle webhook requests
 * Uses API v3 for everything (subscriptions and one-time payments)
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const url = new URL(request.url);
    
    // API v3 uses query parameter signature
    const v3Signature = url.searchParams.get('Signature') || '';

    // Use v3 handler (handles both subscriptions and credit purchases)
    if (process.env.FINBY_PROJECT_ID && process.env.FINBY_SECRET_KEY) {
      return await v3Handler(rawBody, v3Signature);
    }

    // Fallback to v1 if v3 not configured but v1 is
    if (process.env.FINBY_API_KEY && process.env.FINBY_MERCHANT_ID) {
      const v1Signature = request.headers.get('x-finby-signature') || '';
      if (v1Handler) {
        return await v1Handler(rawBody, v1Signature);
      }
    }

    // No handlers configured
    return NextResponse.json(
      { error: 'Webhook handlers not configured' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('[Finby Webhook] Error:', error);
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

