import type {
  PaymentProvider,
  FinbyConfig,
  CheckoutSessionParams,
  CheckoutSession,
  Subscription,
  PaymentEvent,
} from '../types';

/**
 * Finby payment provider implementation
 * Used for the funnel app
 */
export class FinbyProvider implements PaymentProvider {
  readonly type = 'finby' as const;
  private readonly apiKey: string;
  private readonly merchantId: string;
  private readonly webhookSecret?: string;
  private readonly baseUrl: string;

  constructor(config: FinbyConfig) {
    this.apiKey = config.apiKey;
    this.merchantId = config.merchantId;
    this.webhookSecret = config.webhookSecret;
    this.baseUrl = config.baseUrl || 'https://api.finby.io';
  }

  // ===========================================================================
  // Checkout
  // ===========================================================================

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    const response = await fetch(`${this.baseUrl}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'X-Merchant-Id': this.merchantId,
      },
      body: JSON.stringify({
        price_id: params.priceId,
        customer_email: params.email,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          user_id: params.userId,
          ...params.metadata,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Finby checkout error: ${error}`);
    }

    const data = (await response.json()) as { id: string; checkout_url: string };

    return {
      id: data.id,
      url: data.checkout_url,
      provider: 'finby',
    };
  }

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
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
    // Verify signature if webhook secret is configured
    if (this.webhookSecret) {
      const isValid = this.verifySignature(rawBody, signature);
      if (!isValid) {
        throw new Error('Invalid Finby webhook signature');
      }
    }

    const event = JSON.parse(rawBody) as FinbyWebhookEvent;
    return this.mapWebhookEvent(event);
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  private verifySignature(rawBody: string, signature: string): boolean {
    // Simple HMAC verification - adjust based on Finby's actual implementation
    // This is a placeholder - implement according to Finby's documentation
    if (!this.webhookSecret) return true;

    // TODO: Implement actual signature verification
    return signature.length > 0;
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

  private mapWebhookEvent(event: FinbyWebhookEvent): PaymentEvent {
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
