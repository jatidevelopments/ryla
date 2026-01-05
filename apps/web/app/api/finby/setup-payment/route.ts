import { NextRequest, NextResponse } from 'next/server';
import { createPaymentProvider } from '@ryla/payments';
import { createContext } from '@ryla/trpc/context';
import { generateSubscriptionReference, generateCreditReference } from '../../../../lib/utils/payment-reference';
import { CREDIT_PACKAGES, SUBSCRIPTION_PLANS } from '@ryla/shared';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Finby Payment Setup API Route
 * 
 * Creates Finby checkout sessions for subscriptions and credit purchases.
 * Supports both API v1 (subscriptions) and API v3 (one-time payments).
 */

interface SetupPaymentRequest {
  type: 'subscription' | 'credit';
  planId?: string; // For subscriptions: 'starter' | 'pro' | 'unlimited'
  packageId?: string; // For credit purchases: package ID from CREDIT_PACKAGES
  isYearly?: boolean; // For subscriptions
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const ctx = await createContext({
      headers: request.headers,
    });

    if (!ctx.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SetupPaymentRequest = await request.json();

    // Validate request
    if (!body.type) {
      return NextResponse.json(
        { error: 'type is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   (request.headers.get('origin') || 'http://localhost:3000');

    if (body.type === 'subscription') {
      // Handle subscription purchase
      if (!body.planId) {
        return NextResponse.json(
          { error: 'planId is required for subscription' },
          { status: 400 }
        );
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === body.planId);
      if (!plan) {
        return NextResponse.json(
          { error: `Invalid plan: ${body.planId}` },
          { status: 400 }
        );
      }

      // Use Finby API v1 for subscriptions
      const finbyApiKey = process.env.FINBY_API_KEY;
      const finbyMerchantId = process.env.FINBY_MERCHANT_ID;
      const finbyWebhookSecret = process.env.FINBY_WEBHOOK_SECRET;

      if (!finbyApiKey || !finbyMerchantId || !finbyWebhookSecret) {
        console.error('Finby API v1 credentials not configured');
        return NextResponse.json(
          { error: 'Payment system not configured' },
          { status: 500 }
        );
      }

      const finby = createPaymentProvider('finby', {
        apiKey: finbyApiKey,
        merchantId: finbyMerchantId,
        webhookSecret: finbyWebhookSecret,
        apiVersion: 'v1',
      });

      const price = body.isYearly ? plan.priceYearly : plan.priceMonthly;
      const priceId = body.isYearly 
        ? plan.finbyProductIdYearly || `price_${plan.id}_yearly`
        : plan.finbyProductIdMonthly || `price_${plan.id}_monthly`;

      const reference = generateSubscriptionReference(ctx.user.id, body.planId);

      const session = await finby.createCheckoutSession({
        priceId,
        userId: ctx.user.id,
        email: ctx.user.email,
        mode: 'subscription',
        successUrl: `${baseUrl}/payment/success?type=subscription&reference=${reference}`,
        cancelUrl: `${baseUrl}/pricing`,
        notificationUrl: `${baseUrl}/api/finby/webhook`,
        reference,
        metadata: {
          planId: body.planId,
          isYearly: body.isYearly ? 'true' : 'false',
        },
      });

      return NextResponse.json({
        paymentUrl: session.url,
        reference: session.reference,
        transactionId: session.transactionId || session.reference,
      });

    } else if (body.type === 'credit') {
      // Handle credit purchase
      if (!body.packageId) {
        return NextResponse.json(
          { error: 'packageId is required for credit purchase' },
          { status: 400 }
        );
      }

      const package_ = CREDIT_PACKAGES.find(p => p.id === body.packageId);
      if (!package_) {
        return NextResponse.json(
          { error: `Invalid package: ${body.packageId}` },
          { status: 400 }
        );
      }

      // Use Finby API v3 for one-time payments
      const projectId = process.env.FINBY_PROJECT_ID;
      const secretKey = process.env.FINBY_SECRET_KEY;

      if (!projectId || !secretKey) {
        console.error('Finby API v3 credentials not configured');
        return NextResponse.json(
          { error: 'Payment system not configured' },
          { status: 500 }
        );
      }

      const finby = createPaymentProvider('finby', {
        projectId,
        secretKey,
        apiVersion: 'v3',
      });

      const reference = generateCreditReference(ctx.user.id, body.packageId);

      const session = await finby.createCheckoutSession({
        productId: parseInt(package_.finbyProductId || '0') || 0,
        amount: Math.round(package_.price * 100), // Convert to cents
        email: ctx.user.email,
        currency: 'EUR',
        successUrl: `${baseUrl}/payment/success?type=credit&reference=${reference}`,
        cancelUrl: `${baseUrl}/buy-credits`,
        errorUrl: `${baseUrl}/payment/error?reference=${reference}`,
        notificationUrl: `${baseUrl}/api/finby/webhook`,
        cardHolder: ctx.user.name || ctx.user.email.split('@')[0],
        billingCountry: 'US', // Default, can be made dynamic
        reference,
        metadata: {
          packageId: body.packageId,
          credits: package_.credits.toString(),
        },
      });

      return NextResponse.json({
        paymentUrl: session.url,
        reference: session.reference,
        transactionId: session.transactionId || session.reference,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "subscription" or "credit"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Finby setup payment error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

