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

    // Use NEXT_PUBLIC_SITE_URL or fallback to origin, default to app.ryla.ai
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get('origin') ||
      (process.env.NODE_ENV === 'production' ? 'https://app.ryla.ai' : 'http://localhost:3000');

    if (body.type === 'subscription') {
      // Handle subscription purchase
      // NOTE: Using API v3 for subscriptions (one-time monthly payment)
      // We'll track subscription status ourselves and handle renewals
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

      // Use Finby REST API (aapi.finby.eu) with OAuth for subscriptions
      // Uses ProjectID/SecretKey for OAuth authentication
      const projectId = process.env.FINBY_PROJECT_ID;
      const secretKey = process.env.FINBY_SECRET_KEY;

      if (!projectId || !secretKey) {
        console.error('Finby credentials not configured');
        return NextResponse.json(
          { error: 'Payment system not configured' },
          { status: 500 }
        );
      }

      const finby = createPaymentProvider('finby', {
        projectId,
        secretKey,
        apiVersion: 'v1', // Use REST API for subscriptions
        baseUrl: 'https://aapi.finby.eu', // REST API endpoint from docs
      });

      const price = body.isYearly ? plan.priceYearly : plan.priceMonthly;
      const reference = generateSubscriptionReference(ctx.user.id, body.planId);

      // #region agent log
      const logData1 = {location:'api/finby/setup-payment/route.ts:94',message:'Creating subscription checkout session',data:{planId:body.planId,isYearly:body.isYearly,price,reference},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
      await fetch('http://127.0.0.1:7242/ingest/185298ab-d099-4773-bf17-95514dda8b29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData1)}).catch(()=>{});
      // #endregion

      const session = await finby.createCheckoutSession({
        priceId: body.isYearly
          ? plan.finbyProductIdYearly || `price_${plan.id}_yearly`
          : plan.finbyProductIdMonthly || `price_${plan.id}_monthly`,
        userId: ctx.user.id,
        email: ctx.user.email,
        amount: Math.round(price * 100), // Convert to cents
        currency: 'EUR',
        mode: 'subscription', // Mark as subscription
        successUrl: `${baseUrl}/payment/success?type=subscription&reference=${reference}`,
        cancelUrl: `${baseUrl}/pricing`,
        errorUrl: `${baseUrl}/payment/error?reference=${reference}`,
        notificationUrl: `${baseUrl}/api/finby/webhook`,
        reference,
        metadata: {
          planId: body.planId,
          isYearly: body.isYearly ? 'true' : 'false',
          isSubscription: 'true',
        },
      });

      // #region agent log
      const logData2 = {location:'api/finby/setup-payment/route.ts:115',message:'Checkout session created successfully',data:{hasUrl:!!session.url,urlLength:session.url?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
      await fetch('http://127.0.0.1:7242/ingest/185298ab-d099-4773-bf17-95514dda8b29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
      // #endregion

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

      // Finby API v3 requires productId (numeric)
      // Since finbyProductId is stored as a string identifier (e.g., 'credits_500'),
      // we need to map it to a numeric product ID.
      // For now, we'll use a simple hash or index-based mapping.
      // TODO: Configure actual numeric product IDs in Finby merchant portal
      // and store them in the package definition
      const productIdMap: Record<string, number> = {
        'credits_2000': 1,
        'credits_8000': 2,
        'credits_22000': 3,
        'credits_50000': 4,
        'credits_110000': 5,
      };
      const productId = productIdMap[package_.finbyProductId || ''] || 0;

      if (productId === 0) {
        console.warn(`[Finby] No productId mapping found for package ${package_.id}, using 0`);
      }

      const session = await finby.createCheckoutSession({
        priceId: package_.finbyProductId || `price_${package_.id}`,
        userId: ctx.user.id,
        productId, // Required for Finby API v3
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
    // #region agent log
    const errorLog = {location:'api/finby/setup-payment/route.ts:208',message:'Error caught in route handler',data:{errorType:error?.constructor?.name,hasMessage:!!error?.message,messageLength:error?.message?.length||0,messagePreview:error?.message?.substring(0,200)||'',containsHtml:error?.message?.includes('<')||false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
    await fetch('http://127.0.0.1:7242/ingest/185298ab-d099-4773-bf17-95514dda8b29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(errorLog)}).catch(()=>{});
    // #endregion

    console.error('Finby setup payment error:', error);
    
    // Sanitize error message - remove any HTML tags
    let errorMessage = error.message || 'Internal server error';
    // Strip HTML tags and decode HTML entities
    errorMessage = errorMessage
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    
    // If message is too long or contains suspicious content, use generic message
    if (errorMessage.length > 500 || errorMessage.includes('<!DOCTYPE') || errorMessage.includes('<html')) {
      errorMessage = 'Payment service error. Please try again or contact support.';
    }

    // #region agent log
    const sanitizedLog = {location:'api/finby/setup-payment/route.ts:225',message:'Error message sanitized',data:{originalLength:error?.message?.length||0,sanitizedLength:errorMessage.length,sanitizedPreview:errorMessage.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
    await fetch('http://127.0.0.1:7242/ingest/185298ab-d099-4773-bf17-95514dda8b29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sanitizedLog)}).catch(()=>{});
    // #endregion

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

