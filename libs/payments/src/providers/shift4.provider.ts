import * as crypto from 'crypto';
import type {
  PaymentProvider,
  Shift4Config,
  CheckoutSessionParams,
  CheckoutSession,
  Subscription,
  SubscriptionStatus,
  PaymentEvent,
  Customer,
  CreateCustomerParams,
  PaymentStatus,
} from '../types';

/**
 * Shift4 payment provider implementation
 * Supports customer management, signed checkouts, subscriptions, and token-based payments
 */
export class Shift4Provider implements PaymentProvider {
  readonly type = 'shift4' as const;
  private readonly apiUrl: string;
  private readonly secretKey: string;
  private readonly publishableKey: string;
  private readonly webhookSecret: string;
  private readonly tosUrl?: string;

  constructor(config: Shift4Config) {
    this.apiUrl = config.apiUrl;
    this.secretKey = config.secretKey;
    this.publishableKey = config.publishableKey;
    this.webhookSecret = config.webhookSecret;
    this.tosUrl = config.tosUrl;
  }

  // ===========================================================================
  // Authentication
  // ===========================================================================

  /**
   * Get Basic Auth header for API requests
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.secretKey}:`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Generate HMAC SHA256 signature for checkout requests
   * Format: base64(signature|json_request)
   */
  private signCheckoutRequest(requestBody: Record<string, any>): string {
    const jsonRequest = JSON.stringify(requestBody);
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(jsonRequest)
      .digest('base64');

    const signedRequest = `${signature}|${jsonRequest}`;
    return Buffer.from(signedRequest).toString('base64');
  }

  // ===========================================================================
  // Checkout
  // ===========================================================================

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    const isSubscription = params.mode === 'subscription' || params.metadata?.['isSubscription'] === 'true';

    if (isSubscription) {
      // Create subscription checkout
      return this.createSubscriptionCheckout(params);
    } else {
      // Create one-time charge checkout
      return this.createChargeCheckout(params);
    }
  }

  private async createSubscriptionCheckout(params: CheckoutSessionParams): Promise<CheckoutSession> {
    // First, ensure customer exists
    let customerId: string;
    if (params.email) {
      const customer = await this.createCustomer({
        email: params.email,
        userId: params.userId,
        metadata: params.metadata,
      });
      customerId = customer.id;
    } else {
      throw new Error('Email is required for subscription checkout');
    }

    // Create subscription plan if needed (or use existing planId)
    const planId = params.priceId; // Assuming priceId is the plan ID

    const checkoutData = {
      customer_id: customerId,
      plan_id: planId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        user_id: params.userId,
        ...params.metadata,
      },
    };

    const signedRequest = this.signCheckoutRequest(checkoutData);

    const response = await fetch(`${this.apiUrl}/checkout/subscription`, {
      method: 'POST',
      headers: {
        Authorization: this.getAuthHeader(),
        'Content-Type': 'application/json',
        'X-Signature': signedRequest,
      },
      body: JSON.stringify({ signed_request: signedRequest }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shift4 subscription checkout error: ${error}`);
    }

    const data = await response.json();

    return {
      id: data.checkout_id || data.id,
      url: data.checkout_url || data.redirect_url,
      provider: 'shift4',
    };
  }

  private async createChargeCheckout(params: CheckoutSessionParams): Promise<CheckoutSession> {
    const checkoutData = {
      amount: params.amount || 0,
      currency: params.currency || 'USD',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.email,
      metadata: {
        user_id: params.userId,
        ...params.metadata,
      },
    };

    const signedRequest = this.signCheckoutRequest(checkoutData);

    const response = await fetch(`${this.apiUrl}/checkout/charge`, {
      method: 'POST',
      headers: {
        Authorization: this.getAuthHeader(),
        'Content-Type': 'application/json',
        'X-Signature': signedRequest,
      },
      body: JSON.stringify({ signed_request: signedRequest }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shift4 charge checkout error: ${error}`);
    }

    const data = await response.json();

    return {
      id: data.checkout_id || data.id,
      url: data.checkout_url || data.redirect_url,
      provider: 'shift4',
    };
  }

  /**
   * Create a charge using a payment token
   * Used for tokenized payments (stored payment methods)
   */
  async createChargeFromToken(params: {
    token: string;
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<{ chargeId: string; status: string }> {
    const chargeData = {
      token: params.token,
      amount: params.amount,
      currency: params.currency || 'USD',
      customer_id: params.customerId,
      metadata: params.metadata,
    };

    const response = await fetch(`${this.apiUrl}/charges`, {
      method: 'POST',
      headers: {
        Authorization: this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chargeData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shift4 charge error: ${error}`);
    }

    const data = await response.json();

    return {
      chargeId: data.charge_id || data.id,
      status: data.status,
    };
  }

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const response = await fetch(`${this.apiUrl}/subscriptions/${subscriptionId}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get subscription: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapSubscription(data);
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<void> {
    const response = await fetch(`${this.apiUrl}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancel_immediately: immediately,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shift4 cancel subscription error: ${error}`);
    }
  }

  // ===========================================================================
  // Customer Management
  // ===========================================================================

  async createCustomer(params: CreateCustomerParams): Promise<Customer> {
    const response = await fetch(`${this.apiUrl}/customers`, {
      method: 'POST',
      headers: {
        Authorization: this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        metadata: {
          user_id: params.userId,
          ...params.metadata,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shift4 create customer error: ${error}`);
    }

    const data = await response.json();

    return {
      id: data.customer_id || data.id,
      email: params.email,
      provider: 'shift4',
      metadata: data.metadata,
    };
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    try {
      const response = await fetch(`${this.apiUrl}/customers/${customerId}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get customer: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.customer_id || data.id,
        email: data.email,
        provider: 'shift4',
        metadata: data.metadata,
      };
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // ===========================================================================
  // Payment Status
  // ===========================================================================

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
    try {
      // Try as charge ID first
      const response = await fetch(`${this.apiUrl}/charges/${paymentId}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get payment status: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.charge_id || data.id,
        status: this.mapPaymentStatus(data.status),
        amount: data.amount,
        currency: data.currency || 'USD',
        reference: data.reference,
        failureMessage: data.failure_reason || data.error_message,
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      };
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // ===========================================================================
  // Webhooks
  // ===========================================================================

  async parseWebhookEvent(rawBody: string, signature: string): Promise<PaymentEvent> {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch (error) {
      throw new Error('Invalid webhook payload');
    }

    const eventType = event.type || event.event_type;
    const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();

    switch (eventType) {
      case 'charge.succeeded':
      case 'payment.succeeded':
        return {
          id: event.id || event.charge_id,
          type: 'payment.succeeded',
          provider: 'shift4',
          timestamp,
          raw: event,
          data: {
            invoiceId: event.charge_id || event.id,
            customerId: event.customer_id,
            amount: event.amount,
            currency: event.currency || 'USD',
          },
        };

      case 'charge.failed':
      case 'payment.failed':
        return {
          id: event.id || event.charge_id,
          type: 'payment.failed',
          provider: 'shift4',
          timestamp,
          raw: event,
          data: {
            invoiceId: event.charge_id || event.id,
            customerId: event.customer_id,
            error: event.failure_reason || event.error_message,
          },
        };

      case 'subscription.created':
        return {
          id: event.id || event.subscription_id,
          type: 'subscription.created',
          provider: 'shift4',
          timestamp,
          raw: event,
          data: {
            subscriptionId: event.subscription_id || event.id,
            customerId: event.customer_id,
            status: this.mapSubscriptionStatus(event.status),
            priceId: event.plan_id,
            currentPeriodEnd: event.current_period_end ? new Date(event.current_period_end) : undefined,
          },
        };

      case 'subscription.updated':
        return {
          id: event.id || event.subscription_id,
          type: 'subscription.updated',
          provider: 'shift4',
          timestamp,
          raw: event,
          data: {
            subscriptionId: event.subscription_id || event.id,
            customerId: event.customer_id,
            status: this.mapSubscriptionStatus(event.status),
            currentPeriodEnd: event.current_period_end ? new Date(event.current_period_end) : undefined,
          },
        };

      case 'subscription.cancelled':
        return {
          id: event.id || event.subscription_id,
          type: 'subscription.cancelled',
          provider: 'shift4',
          timestamp,
          raw: event,
          data: {
            subscriptionId: event.subscription_id || event.id,
            customerId: event.customer_id,
            status: 'cancelled',
            cancelAtPeriodEnd: event.cancel_at_period_end || false,
          },
        };

      case 'subscription.renewed':
        return {
          id: event.id || event.subscription_id,
          type: 'subscription.renewed',
          provider: 'shift4',
          timestamp,
          raw: event,
          data: {
            subscriptionId: event.subscription_id || event.id,
            customerId: event.customer_id,
            status: this.mapSubscriptionStatus(event.status),
            currentPeriodEnd: event.current_period_end ? new Date(event.current_period_end) : undefined,
          },
        };

      case 'chargeback.created':
      case 'chargeback':
        return {
          id: event.id || event.chargeback_id,
          type: 'chargeback.created',
          provider: 'shift4',
          timestamp,
          raw: event,
          data: {
            chargeId: event.charge_id || event.payment_id,
            subscriptionId: event.subscription_id,
            customerId: event.customer_id,
            amount: event.amount,
            currency: event.currency || 'USD',
            reason: event.reason || event.chargeback_reason,
          },
        };

      default:
        throw new Error(`Unknown Shift4 webhook event type: ${eventType}`);
    }
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  private mapSubscription(data: any): Subscription {
    return {
      id: data.subscription_id || data.id,
      userId: data.metadata?.user_id || '',
      customerId: data.customer_id,
      status: this.mapSubscriptionStatus(data.status),
      priceId: data.plan_id || data.price_id || '',
      planId: data.plan_id || '',
      currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : new Date(),
      currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : new Date(),
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
      cancelledAt: data.cancelled_at ? new Date(data.cancelled_at) : undefined,
    };
  }

  private mapSubscriptionStatus(status: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: 'active',
      cancelled: 'cancelled',
      past_due: 'past_due',
      unpaid: 'unpaid',
      trialing: 'trialing',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
    };

    return statusMap[status.toLowerCase()] || 'incomplete';
  }

  private mapPaymentStatus(status: string): PaymentStatus['status'] {
    const statusMap: Record<string, PaymentStatus['status']> = {
      pending: 'pending',
      paid: 'paid',
      failed: 'failed',
      processing: 'processing',
      authorized: 'authorized',
      refunded: 'refunded',
      completed: 'paid',
      succeeded: 'paid',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }
}

