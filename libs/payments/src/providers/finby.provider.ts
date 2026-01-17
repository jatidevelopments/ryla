import * as crypto from 'crypto';
import type {
  PaymentProvider,
  FinbyConfig,
  CheckoutSessionParams,
  CheckoutSession,
  Subscription,
  PaymentEvent,
} from '../types';
import { generateFinbyReference } from '../utils/finby-reference';

/**
 * Finby payment provider implementation
 * Supports both API v3 (popup-based) and API v1 (REST-based)
 * Used for the funnel app (v3) and future subscription features (v1)
 */
export class FinbyProvider implements PaymentProvider {
  readonly type = 'finby' as const;
  private readonly apiVersion: 'v3' | 'v1';

  // API v3 (Popup-based) credentials
  private readonly projectId?: string;
  private readonly secretKey?: string;

  // API v1 (REST-based) credentials
  private readonly apiKey?: string;
  private readonly merchantId?: string;

  private readonly webhookSecret?: string;
  private readonly baseUrl: string;

  // OAuth token cache for REST API
  private accessTokenCache?: { token: string; expiresAt: number };

  constructor(config: FinbyConfig) {
    this.apiVersion = config.apiVersion || (config.projectId && config.secretKey ? 'v3' : 'v1');

    // API v3 credentials
    this.projectId = config.projectId;
    this.secretKey = config.secretKey;

    // API v1 credentials (legacy - for direct API key auth)
    this.apiKey = config.apiKey;
    this.merchantId = config.merchantId;

    this.webhookSecret = config.webhookSecret;
    // MAPI5 API uses amapi.finby.eu/mapi5 for both v3 and v1
    // v3 is for popup-based one-time payments
    // v1 is for URL-based payments (subscriptions and credits)
    this.baseUrl = config.baseUrl || 'https://amapi.finby.eu/mapi5';
  }

  /**
   * Get OAuth access token for REST API (aapi.finby.eu)
   * Uses ProjectID and SecretKey for authentication
   * Based on: https://doc.finby.eu/aapi/#oauth-getting-access-token
   */
  private async getOAuthToken(): Promise<string> {
    // Check cache (tokens expire in 30 minutes)
    if (this.accessTokenCache && this.accessTokenCache.expiresAt > Date.now()) {
      return this.accessTokenCache.token;
    }

    if (!this.projectId || !this.secretKey) {
      throw new Error('Finby REST API requires projectId and secretKey for OAuth');
    }

    const credentials = Buffer.from(`${this.projectId}:${this.secretKey}`).toString('base64');

    const response = await fetch('https://aapi.finby.eu/api/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Finby OAuth] Failed to get token: ${response.status} ${response.statusText}`, error);
      throw new Error(`Finby OAuth token error: ${error}`);
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    const expiresIn = (data.expires_in || 1799) * 1000; // Convert to milliseconds (default 30 min)
    const expiresAt = Date.now() + expiresIn - 300000; // Refresh 5 min before expiry

    this.accessTokenCache = {
      token: data.access_token,
      expiresAt,
    };

    return data.access_token;
  }

  // ===========================================================================
  // Checkout
  // ===========================================================================

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    // API v3 only supports one-time payments
    if (this.apiVersion === 'v3') {
      // Check if subscription is requested - not supported in v3
      const isSubscription =
        params.metadata?.['isSubscription'] === 'true' ||
        params.mode === 'subscription';

      if (isSubscription) {
        // For subscriptions, use REST API (v1) with OAuth
        // ProjectID/SecretKey can be used for OAuth authentication
        if (this.projectId && this.secretKey) {
          // Switch to REST API mode for subscriptions
          return this.createCheckoutSessionV1(params);
        }

        throw new Error(
          'Subscriptions require Finby REST API. ' +
          'Please provide projectId and secretKey for OAuth authentication, or use apiKey/merchantId for direct API access.'
        );
      }

      return this.createCheckoutSessionV3(params);
    } else {
      // API v1 supports both subscriptions and one-time payments
      return this.createCheckoutSessionV1(params);
    }
  }

  /**
   * Create checkout session using Finby API v3 (redirect-based)
   * The payment URL can be used for both popup and redirect flows
   */
  private async createCheckoutSessionV3(params: CheckoutSessionParams): Promise<CheckoutSession> {
    if (!this.projectId || !this.secretKey) {
      throw new Error('Finby API v3 requires projectId and secretKey');
    }

    // Validate required parameters for Finby API v3
    // Required: productId, amount, and email (per Finby API requirements)
    if (!params.productId || !params.amount || !params.email) {
      throw new Error('productId, amount, and email are required for Finby API v3');
    }

    // Ensure productId is a valid number
    if (typeof params.productId !== 'number' || isNaN(params.productId) || params.productId < 0) {
      throw new Error('productId must be a valid non-negative number');
    }

    // Generate reference if not provided
    const reference = params.reference || generateFinbyReference();

    // Convert amount from cents to decimal
    const amount = params.amount / 100;
    const currency = params.currency || 'EUR';
    const paymentType = 0; // 0 = Purchase

    // Build signature data for card payments
    // Format: AccountId/Amount/Currency/Reference/PaymentType/BillingCity/BillingCountry/BillingPostcode/BillingStreet/CardHolder/Email
    const billingCity = params.billingCity || 'Unknown';
    const billingCountry = params.billingCountry || 'US';
    const billingPostcode = params.billingPostcode || '00000';
    const billingStreet = params.billingStreet || 'Unknown';
    const cardHolder = params.cardHolder || params.email.split('@')[0];
    const email = params.email;

    const sigData = `${this.projectId}/${amount.toFixed(2)}/${currency}/${reference}/${paymentType}/${billingCity}/${billingCountry}/${billingPostcode}/${billingStreet}/${cardHolder}/${email}`;
    const signature = this.generateSignature(this.secretKey, sigData);

    // Build Finby payment URL for redirect
    // Note: PayPopup endpoint works for both popup and redirect flows
    // When using window.location.href, it will redirect to a full-page payment form
    const baseUrl = 'https://amapi.finby.eu/mapi5/Card/PayPopup';
    const urlParams = new URLSearchParams({
      AccountId: this.projectId,
      Amount: amount.toFixed(2),
      Currency: currency,
      Reference: reference,
      PaymentType: paymentType.toString(),
      Signature: signature,
      BillingCity: billingCity,
      BillingCountry: billingCountry,
      BillingPostcode: billingPostcode,
      BillingStreet: billingStreet,
      CardHolder: cardHolder,
      Email: email,
    });

    // Add optional URLs
    if (params.successUrl) {
      urlParams.append('ReturnUrl', params.successUrl);
    }
    if (params.cancelUrl) {
      urlParams.append('CancelUrl', params.cancelUrl);
    }
    if (params.errorUrl) {
      urlParams.append('ErrorUrl', params.errorUrl);
    }
    if (params.notificationUrl) {
      urlParams.append('NotificationUrl', params.notificationUrl);
    }

    const paymentUrl = `${baseUrl}?${urlParams.toString()}`;

    return {
      id: reference,
      url: paymentUrl,
      provider: 'finby',
      reference,
      transactionId: reference,
    };
  }

  /**
   * Create checkout session using Finby MAPI5 API (amapi.finby.eu/mapi5/Card/PayPopup)
   * Supports both subscriptions and one-time payments
   * Uses URL query parameters (not REST JSON API)
   * Based on: https://doc.finby.eu (MAPI5 documentation)
   */
  private async createCheckoutSessionV1(params: CheckoutSessionParams): Promise<CheckoutSession> {
    if (!this.projectId || !this.secretKey) {
      throw new Error('Finby MAPI5 API requires projectId and secretKey');
    }

    // Determine if this is a subscription or one-time payment (credit purchase)
    const isSubscription =
      params.metadata?.['isSubscription'] === 'true' ||
      params.mode === 'subscription' ||
      params.metadata?.['subscription'] === 'true';

    const isCreditPurchase = !isSubscription; // Credit purchases are one-time payments

    // Generate reference if not provided
    const reference = params.reference || generateFinbyReference();

    // Convert amount from cents to decimal (exactly 2 decimal places)
    const amount = params.amount ? (params.amount / 100).toFixed(2) : '0.00';
    const currency = params.currency || 'EUR';

    // PaymentType: 0 = Purchase, 1 = Register Card, 3 = Recurring Initial
    // Use PaymentType=3 for subscriptions (Recurring Initial - saves card for future charges)
    // Use PaymentType=0 for credit purchases (simple one-time Purchase)
    // Note: PaymentType=1 (RegisterCard) was causing issues - use 0 for simple purchases
    const paymentType = isSubscription ? 3 : 0;

    // Required billing fields (from SCA requirements)
    const billingCity = params.billingCity || 'Unknown';
    const billingCountry = params.billingCountry || 'US';
    const billingPostcode = params.billingPostcode || '00000';
    const billingStreet = params.billingStreet || 'Unknown';
    const cardHolder = params.cardHolder || (params.email ? params.email.split('@')[0] : 'Customer');
    const email = params.email || '';

    // Build signature data according to Finby documentation
    // For PaymentType 3 (Recurring Initial): AccountId/Amount/Currency/Reference/PaymentType
    // For PaymentType 1 (Register Card): AccountId/Amount/Currency/Reference/PaymentType/BillingCity/BillingCountry/BillingPostcode/BillingStreet/CardHolder/Email
    let sigData: string;
    if (paymentType === 3) {
      // Recurring initial payment - simpler signature
      sigData = `${this.projectId}/${amount}/${currency}/${reference}/${paymentType}`;
    } else {
      // Purchase or Register Card - full signature with billing details
      sigData = `${this.projectId}/${amount}/${currency}/${reference}/${paymentType}/${billingCity}/${billingCountry}/${billingPostcode}/${billingStreet}/${cardHolder}/${email}`;
    }

    const signature = this.generateSignature(this.secretKey, sigData);

    // Build URL with query parameters (Finby uses URL parameters, not JSON body)
    const baseUrl = 'https://amapi.finby.eu/mapi5/Card/PayPopup';

    const urlParams = new URLSearchParams({
      AccountId: this.projectId,
      Amount: amount,
      Currency: currency,
      Reference: reference,
      PaymentType: paymentType.toString(),
      Signature: signature,
    });

    // Add billing fields (required for card payments)
    // Include for ALL payment types including PaymentType=3 (recurring initial)
      urlParams.append('BillingCity', billingCity);
      urlParams.append('BillingCountry', billingCountry);
      urlParams.append('BillingPostcode', billingPostcode);
      urlParams.append('BillingStreet', billingStreet);
      urlParams.append('CardHolder', cardHolder);
      urlParams.append('Email', email);

    // Add optional URLs
    if (params.successUrl) {
      urlParams.append('ReturnUrl', params.successUrl);
    }
    if (params.cancelUrl) {
      urlParams.append('CancelUrl', params.cancelUrl);
    }
    if (params.errorUrl) {
      urlParams.append('ErrorUrl', params.errorUrl);
    }
    if (params.notificationUrl) {
      urlParams.append('NotificationUrl', params.notificationUrl);
    }

    // For subscriptions, add IsRedirect=true to allow redirect flow
    if (isSubscription) {
      urlParams.append('IsRedirect', 'True');
    }

    const paymentUrl = `${baseUrl}?${urlParams.toString()}`;

    // For Finby MAPI5, we return the URL directly (not a JSON response)
    // The URL can be used for redirect or popup
    return {
      id: reference,
      url: paymentUrl,
      provider: 'finby',
      reference,
      transactionId: reference, // Will be updated from webhook notification
    };
  }

  // ===========================================================================
  // Recurring Payments
  // ===========================================================================

  /**
   * Create a recurring payment using PaymentRequestId (subsequent recurring payment)
   * For subsequent subscription charges after initial payment
   * Based on Finby MAPI5 documentation: PaymentType=4
   * This is a background call (not a redirect)
   */
  async createRecurringPayment(params: {
    amount: number; // in cents
    currency?: string;
    userId: string;
    email: string;
    originalPaymentRequestId: string; // Initial payment request ID (PaymentRequestId from notification)
    reference?: string;
    notificationUrl?: string;
    cardHash?: string; // Not used for Finby - we use PaymentRequestId instead
  }): Promise<{ resultCode: number; paymentRequestId?: string; acquirerResponseId?: string }> {
    if (!this.projectId || !this.secretKey) {
      throw new Error('Finby MAPI5 API requires projectId and secretKey');
    }

    const currency = params.currency || 'EUR';
    const reference = params.reference || generateFinbyReference();

    // Convert amount from cents to decimal (exactly 2 decimal places)
    const amount = (params.amount / 100).toFixed(2);

    // PaymentType=4 for subsequent recurring payment
    const paymentType = 4;

    // Required billing fields (from SCA requirements)
    const billingCity = 'Unknown'; // Not required for subsequent payments, but included for signature
    const billingCountry = 'US';
    const billingPostcode = '00000';
    const billingStreet = 'Unknown';
    const cardHolder = params.email ? params.email.split('@')[0] : 'Customer';
    const email = params.email || '';

    // Build signature data according to Finby documentation
    // For PaymentType 4 (Recurring Subsequent): AccountId/Amount/Currency/Reference/PaymentType/BillingCity/BillingCountry/BillingPostcode/BillingStreet/CardHolder/Email/PaymentRequestId
    const sigData = `${this.projectId}/${amount}/${currency}/${reference}/${paymentType}/${billingCity}/${billingCountry}/${billingPostcode}/${billingStreet}/${cardHolder}/${email}/${params.originalPaymentRequestId}`;

    const signature = this.generateSignature(this.secretKey, sigData);

    // Build URL with query parameters
    const baseUrl = 'https://amapi.finby.eu/mapi5/Card/PayPopup';
    const urlParams = new URLSearchParams({
      AccountId: this.projectId,
      Amount: amount,
      Currency: currency,
      Reference: reference,
      PaymentType: paymentType.toString(),
      PaymentRequestId: params.originalPaymentRequestId,
      Signature: signature,
    });

    // Add billing fields (required for signature calculation)
    urlParams.append('BillingCity', billingCity);
    urlParams.append('BillingCountry', billingCountry);
    urlParams.append('BillingPostcode', billingPostcode);
    urlParams.append('BillingStreet', billingStreet);
    urlParams.append('CardHolder', cardHolder);
    urlParams.append('Email', email);

    if (params.notificationUrl) {
      urlParams.append('NotificationUrl', params.notificationUrl);
    }

    const paymentUrl = `${baseUrl}?${urlParams.toString()}`;

    // For subsequent recurring payments, this is a background call (not a redirect)
    // POST to the URL and get JSON response
    const response = await fetch(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const sanitizedError = errorText.includes('<')
        ? `Payment service error (${response.status}). Please try again.`
        : errorText.substring(0, 200);
      throw new Error(`Finby recurring payment error: ${sanitizedError}`);
    }

    // Response should be JSON with ResultCode
    const data = (await response.json()) as {
      ResultCode?: number;
      AcquirerResponseId?: string;
      PaymentRequestId?: string;
    };

    return {
      resultCode: data.ResultCode ?? -1,
      paymentRequestId: data.PaymentRequestId,
      acquirerResponseId: data.AcquirerResponseId,
    };
  }

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    if (this.apiVersion === 'v3') {
      // API v3 doesn't support subscription management
      // Subscriptions are handled via one-time payments
      throw new Error('Subscription management not supported in Finby API v3');
    }

    if (!this.apiKey || !this.merchantId) {
      throw new Error('Finby API v1 requires apiKey and merchantId');
    }

    const response = await fetch(`${this.baseUrl}/v1/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-Merchant-Id': this.merchantId,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Finby getSubscription error: ${response.statusText}`);
    }

    const data = (await response.json()) as FinbySubscription;

    return {
      id: data.id,
      userId: data.metadata?.['user_id'] || '',
      customerId: data.customer_id,
      status: this.mapStatus(data.status),
      priceId: data.price_id,
      planId: data.product_id,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      cancelledAt: data.cancelled_at ? new Date(data.cancelled_at) : undefined,
    };
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<void> {
    if (this.apiVersion === 'v3') {
      throw new Error('Subscription management not supported in Finby API v3');
    }

    if (!this.apiKey || !this.merchantId) {
      throw new Error('Finby API v1 requires apiKey and merchantId');
    }

    await fetch(`${this.baseUrl}/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'X-Merchant-Id': this.merchantId,
      },
      body: JSON.stringify({
        immediately,
      }),
    });
  }

  // ===========================================================================
  // Webhooks
  // ===========================================================================

  async parseWebhookEvent(rawBody: string, signature: string): Promise<PaymentEvent> {
    if (this.apiVersion === 'v3') {
      return this.parseWebhookEventV3(rawBody, signature);
    } else {
      return this.parseWebhookEventV1(rawBody, signature);
    }
  }

  /**
   * Parse webhook event from Finby API v3 (popup-based)
   * Finby sends notifications as URL query parameters or JSON body
   */
  private async parseWebhookEventV3(rawBody: string, signature: string): Promise<PaymentEvent> {
    if (!this.secretKey) {
      throw new Error('Finby API v3 requires secretKey for webhook verification');
    }

    // Parse the raw body - could be JSON or URL-encoded query string
    let params: Record<string, string> = {};

    try {
      // Try parsing as JSON first
      const jsonData = JSON.parse(rawBody);
      params = jsonData as Record<string, string>;
    } catch {
      // If not JSON, try parsing as URL-encoded query string
      const urlParams = new URLSearchParams(rawBody);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    // Verify signature
    const providedSignature = params['Signature'] || signature;
    if (!providedSignature) {
      throw new Error('Missing signature in Finby notification');
    }

    const isValid = this.verifySignatureV3(this.secretKey, params, providedSignature);
    if (!isValid) {
      throw new Error('Invalid Finby webhook signature');
    }

    // Map to PaymentEvent
    return this.mapWebhookEventV3(params);
  }

  /**
   * Parse webhook event from Finby API v1 (REST-based)
   */
  private async parseWebhookEventV1(rawBody: string, signature: string): Promise<PaymentEvent> {
    // Verify signature if webhook secret is configured
    if (this.webhookSecret) {
      const isValid = this.verifySignatureV1(rawBody, signature);
      if (!isValid) {
        throw new Error('Invalid Finby webhook signature');
      }
    }

    const event = JSON.parse(rawBody) as FinbyWebhookEvent;
    return this.mapWebhookEventV1(event);
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Generate HMAC SHA256 signature for Finby API v3
   */
  private generateSignature(secretKey: string, data: string): string {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(data);
    return hmac.digest('hex').toUpperCase();
  }

  /**
   * Verify webhook signature for Finby API v3
   * Format: AccountId/Amount/Currency/Type/ResultCode/CounterAccount/CounterAccountName/OrderId/PaymentId/Reference/RefuseReason
   */
  private verifySignatureV3(secretKey: string, params: Record<string, string>, signature: string): boolean {
    const sigData = [
      params['AccountId'],
      params['Amount'],
      params['Currency'],
      params['Type'],
      params['ResultCode'],
      params['CounterAccount'] || '',
      params['CounterAccountName'] || '',
      params['OrderId'] || '',
      params['PaymentId'] || '',
      params['Reference'],
      params['RefuseReason'] || '',
    ].join('/');

    const calculatedSignature = this.generateSignature(secretKey, sigData);
    return calculatedSignature === signature.toUpperCase();
  }

  /**
   * Verify webhook signature for Finby API v1
   */
  private verifySignatureV1(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) return true;

    // Implement HMAC verification for API v1
    // This may need adjustment based on Finby's actual implementation
    const calculatedSignature = this.generateSignature(this.webhookSecret, rawBody);
    return calculatedSignature === signature;
  }

  private mapStatus(status: string): Subscription['status'] {
    const statusMap: Record<string, Subscription['status']> = {
      active: 'active',
      cancelled: 'cancelled',
      canceled: 'cancelled',
      past_due: 'past_due',
      unpaid: 'unpaid',
      trialing: 'trialing',
    };
    return statusMap[status] || 'active';
  }

  /**
   * Map Finby API v3 webhook notification to PaymentEvent
   */
  private mapWebhookEventV3(params: Record<string, string>): PaymentEvent {
    const resultCode = parseInt(params['ResultCode'] || '0', 10);
    const reference = params['Reference'];
    const paymentId = params['PaymentId'] || params['PaymentRequestId'] || '';
    const amount = parseFloat(params['Amount'] || '0');
    const currency = params['Currency'] || 'EUR';

    const baseEvent = {
      id: paymentId || reference || `finby-${Date.now()}`,
      provider: 'finby' as const,
      timestamp: new Date(),
      raw: params,
    };

    // ResultCode 0 = success
    if (resultCode === 0) {
      return {
        ...baseEvent,
        type: 'payment.succeeded',
        data: {
          invoiceId: paymentId,
          subscriptionId: reference, // Use reference as subscription ID for v3
          customerId: params['CounterAccount'] || '',
          amount: amount * 100, // Convert to cents
          currency: currency.toLowerCase(),
        },
      };
    } else {
      // Payment failed
      return {
        ...baseEvent,
        type: 'payment.failed',
        data: {
          invoiceId: paymentId,
          subscriptionId: reference,
          customerId: params['CounterAccount'] || '',
          error: params['RefuseReason'] || `Payment failed with result code: ${resultCode}`,
        },
      };
    }
  }

  /**
   * Map Finby API v1 webhook event to PaymentEvent
   */
  private mapWebhookEventV1(event: FinbyWebhookEvent): PaymentEvent {
    const baseEvent = {
      id: event.id,
      provider: 'finby' as const,
      timestamp: new Date(event.created_at),
      raw: event,
    };

    switch (event.type) {
      case 'checkout.completed':
        return {
          ...baseEvent,
          type: 'checkout.completed',
          data: {
            userId: event.data.metadata?.['user_id'] || '',
            customerId: event.data.customer_id,
            subscriptionId: event.data.subscription_id,
            priceId: event.data.price_id,
            email: event.data.customer_email,
          },
        };

      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.cancelled':
        return {
          ...baseEvent,
          type: event.type === 'subscription.cancelled' ? 'subscription.cancelled' : event.type,
          data: {
            subscriptionId: event.data.subscription_id,
            customerId: event.data.customer_id,
            status: this.mapStatus(event.data.status || 'active'),
            priceId: event.data.price_id,
            currentPeriodEnd: event.data.current_period_end
              ? new Date(event.data.current_period_end)
              : undefined,
          },
        };

      case 'payment.succeeded':
        return {
          ...baseEvent,
          type: 'payment.succeeded',
          data: {
            invoiceId: event.data.invoice_id || '',
            subscriptionId: event.data.subscription_id,
            customerId: event.data.customer_id,
            amount: event.data.amount || 0,
            currency: event.data.currency || 'usd',
            currentPeriodEnd: event.data.current_period_end
              ? new Date(event.data.current_period_end)
              : undefined,
          },
        };

      case 'payment.failed':
        return {
          ...baseEvent,
          type: 'payment.failed',
          data: {
            invoiceId: event.data.invoice_id || '',
            subscriptionId: event.data.subscription_id,
            customerId: event.data.customer_id,
            error: event.data.error_message,
          },
        };

      case 'chargeback.created':
      case 'chargeback':
        return {
          ...baseEvent,
          type: 'chargeback.created',
          data: {
            chargeId: (event.data as any).charge_id || (event.data as any).payment_id || '',
            subscriptionId: event.data.subscription_id,
            customerId: event.data.customer_id,
            amount: event.data.amount || 0,
            currency: event.data.currency || 'eur',
            reason: (event.data as any).reason || (event.data as any).chargeback_reason,
          },
        };

      default:
        throw new Error(`Unhandled Finby event type: ${event.type}`);
    }
  }
}

// ===========================================================================
// Finby API Types
// ===========================================================================

interface FinbySubscription {
  id: string;
  customer_id: string;
  price_id: string;
  product_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  metadata?: Record<string, string>;
}

interface FinbyWebhookEvent {
  id: string;
  type: string;
  created_at: string;
  data: {
    customer_id: string;
    customer_email?: string;
    subscription_id: string;
    price_id: string;
    status?: string;
    current_period_end?: string;
    invoice_id?: string;
    amount?: number;
    currency?: string;
    error_message?: string;
    metadata?: Record<string, string>;
  };
}
