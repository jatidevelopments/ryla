import crypto from 'crypto';
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

  constructor(config: FinbyConfig) {
    this.apiVersion = config.apiVersion || (config.projectId && config.secretKey ? 'v3' : 'v1');
    
    // API v3 credentials
    this.projectId = config.projectId;
    this.secretKey = config.secretKey;
    
    // API v1 credentials
    this.apiKey = config.apiKey;
    this.merchantId = config.merchantId;
    
    this.webhookSecret = config.webhookSecret;
    this.baseUrl = config.baseUrl || (this.apiVersion === 'v3' ? 'https://amapi.finby.eu/mapi5' : 'https://api.finby.io');
  }

  // ===========================================================================
  // Checkout
  // ===========================================================================

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    // API v3 only supports one-time payments
    if (this.apiVersion === 'v3') {
      // Check if subscription is requested - not supported in v3
      const isSubscription = 
        params.metadata?.isSubscription === 'true' ||
        params.mode === 'subscription';
      
      if (isSubscription) {
        throw new Error(
          'Subscriptions are not supported in Finby API v3. ' +
          'Please use Finby API v1 (set apiVersion: "v1" and provide apiKey/merchantId) for subscriptions.'
        );
      }
      
      return this.createCheckoutSessionV3(params);
    } else {
      // API v1 supports both subscriptions and one-time payments
      return this.createCheckoutSessionV1(params);
    }
  }

  /**
   * Create checkout session using Finby API v3 (popup-based)
   * Used by the funnel app
   */
  private async createCheckoutSessionV3(params: CheckoutSessionParams): Promise<CheckoutSession> {
    if (!this.projectId || !this.secretKey) {
      throw new Error('Finby API v3 requires projectId and secretKey');
    }

    if (!params.productId || !params.amount || !params.email) {
      throw new Error('productId, amount, and email are required for Finby API v3');
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

    // Build Finby payment URL
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
   * Create checkout session using Finby API v1 (REST-based)
   * Supports both subscriptions and one-time payments
   */
  private async createCheckoutSessionV1(params: CheckoutSessionParams): Promise<CheckoutSession> {
    if (!this.apiKey || !this.merchantId) {
      throw new Error('Finby API v1 requires apiKey and merchantId');
    }

    // Determine if this is a subscription or one-time payment
    // Check metadata flag or mode parameter (similar to Stripe)
    const isSubscription = 
      params.metadata?.isSubscription === 'true' ||
      params.mode === 'subscription' ||
      params.metadata?.subscription === 'true';

    const requestBody: Record<string, any> = {
      price_id: params.priceId,
      customer_email: params.email,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        user_id: params.userId,
        ...params.metadata,
      },
    };

    // Add subscription-specific parameters if it's a subscription
    if (isSubscription) {
      requestBody.subscription = true;
      // Optional: Add trial period, billing cycle, etc. if provided in metadata
      if (params.metadata?.trial_period_days) {
        requestBody.trial_period_days = parseInt(params.metadata.trial_period_days, 10);
      }
    }

    const response = await fetch(`${this.baseUrl}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'X-Merchant-Id': this.merchantId,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Finby checkout error: ${error}`);
    }

    const data = (await response.json()) as { id: string; checkout_url: string; subscription_id?: string };

    return {
      id: data.id,
      url: data.checkout_url,
      provider: 'finby',
      reference: data.subscription_id || data.id, // Use subscription_id if available
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
    const providedSignature = params.Signature || signature;
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
      params.AccountId,
      params.Amount,
      params.Currency,
      params.Type,
      params.ResultCode,
      params.CounterAccount || '',
      params.CounterAccountName || '',
      params.OrderId || '',
      params.PaymentId || '',
      params.Reference,
      params.RefuseReason || '',
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
    const resultCode = parseInt(params.ResultCode || '0', 10);
    const reference = params.Reference;
    const paymentId = params.PaymentId || params.PaymentRequestId || '';
    const amount = parseFloat(params.Amount || '0');
    const currency = params.Currency || 'EUR';

    const baseEvent = {
      id: paymentId || reference || `finby-${Date.now()}`,
      provider: 'finby' as const,
      timestamp: new Date(),
      raw: params,
    };

    // ResultCode 0 = success
    if (resultCode === 0) {
      // Parse reference to extract userId if in format "sub_{userId}_{planId}"
      const refParts = reference?.split('_') || [];
      const userId = refParts[1] || params.userId || '';
      const planId = refParts[2] || params.planId || '';

      return {
        ...baseEvent,
        type: 'payment.succeeded',
        data: {
          invoiceId: paymentId,
          subscriptionId: reference, // Use reference as subscription ID for v3
          customerId: params.CounterAccount || '',
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
          customerId: params.CounterAccount || '',
          error: params.RefuseReason || `Payment failed with result code: ${resultCode}`,
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
            chargeId: event.data.charge_id || event.data.payment_id || '',
            subscriptionId: event.data.subscription_id,
            customerId: event.data.customer_id,
            amount: event.data.amount || 0,
            currency: event.data.currency || 'eur',
            reason: event.data.reason || event.data.chargeback_reason,
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
