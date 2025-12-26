import crypto from 'crypto';
import type {
  PaymentProvider,
  TrustPayConfig,
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
 * TrustPay payment provider implementation
 * Supports card tokenization, recurring payments, and server-initiated payments
 */
export class TrustPayProvider implements PaymentProvider {
  readonly type = 'trustpay' as const;
  private readonly baseUrl: string;
  private readonly tokenUrl: string;
  private readonly username: string;
  private readonly secret: string;
  private accessTokenCache?: { token: string; expiresAt: number };

  constructor(config: TrustPayConfig) {
    this.baseUrl = config.url;
    this.tokenUrl = config.tokenUrl;
    this.username = config.tpUsername;
    this.secret = config.tpSecret;
  }

  // ===========================================================================
  // Authentication
  // ===========================================================================

  /**
   * Get OAuth2 access token (Bearer token)
   * Uses client credentials flow
   */
  private async getAccessToken(): Promise<string> {
    // Check cache (tokens typically expire in 1 hour)
    if (this.accessTokenCache && this.accessTokenCache.expiresAt > Date.now()) {
      return this.accessTokenCache.token;
    }

    const credentials = Buffer.from(`${this.username}:${this.secret}`).toString('base64');

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TrustPay token error: ${error}`);
    }

    const data = await response.json();
    const expiresIn = (data.expires_in || 3600) * 1000; // Convert to milliseconds
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
    const accessToken = await this.getAccessToken();
    const isSubscription = params.mode === 'subscription' || params.metadata?.isSubscription === 'true';

    // TrustPay uses redirect-based checkout
    const checkoutData = {
      amount: params.amount || 0,
      currency: params.currency || 'EUR',
      reference: params.reference || this.generateReference(),
      return_url: params.successUrl,
      cancel_url: params.cancelUrl,
      notification_url: params.notificationUrl,
      customer_email: params.email,
      metadata: {
        user_id: params.userId,
        ...params.metadata,
        is_subscription: isSubscription ? 'true' : 'false',
      },
    };

    const response = await fetch(`${this.baseUrl}/api/v1/checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TrustPay checkout error: ${error}`);
    }

    const data = await response.json();

    return {
      id: data.checkout_id || data.id,
      url: data.checkout_url || data.redirect_url,
      provider: 'trustpay',
      reference: data.reference || checkoutData.reference,
    };
  }

  // ===========================================================================
  // Recurring Payments
  // ===========================================================================

  /**
   * Create a recurring payment using a stored card token
   * This is server-initiated (no user interaction required)
   */
  async createRecurringPayment(params: {
    cardToken: string;
    amount: number;
    currency: string;
    reference?: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<{ paymentId: string; status: string }> {
    const accessToken = await this.getAccessToken();

    const paymentData = {
      card_token: params.cardToken,
      amount: params.amount,
      currency: params.currency || 'EUR',
      reference: params.reference || this.generateReference(),
      customer_id: params.customerId,
      metadata: params.metadata,
    };

    const response = await fetch(`${this.baseUrl}/api/v1/payments/recurring`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TrustPay recurring payment error: ${error}`);
    }

    const data = await response.json();

    return {
      paymentId: data.payment_id || data.id,
      status: data.status,
    };
  }

  /**
   * Recover a failed recurring payment with retry logic
   * Implements exponential backoff: 1h, 2h, 4h, 8h, 16h, 32h
   */
  async recoverRecurringPayment(params: {
    paymentId: string;
    retryAttempt: number;
    cardToken?: string;
  }): Promise<{ paymentId: string; status: string; nextRetry?: Date }> {
    const accessToken = await this.getAccessToken();

    // Get original payment details
    const paymentResponse = await fetch(`${this.baseUrl}/api/v1/payments/${params.paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!paymentResponse.ok) {
      throw new Error(`Failed to fetch payment: ${paymentResponse.statusText}`);
    }

    const payment = await paymentResponse.json();

    // Max 6 retries
    if (params.retryAttempt > 6) {
      throw new Error('Max retry attempts reached');
    }

    // Calculate next retry time (exponential backoff)
    const retryDelays = [3600000, 7200000, 14400000, 28800000, 57600000, 115200000]; // ms
    const delay = retryDelays[params.retryAttempt - 1] || retryDelays[retryDelays.length - 1];
    const nextRetry = new Date(Date.now() + delay);

    // Retry the payment
    const retryData = {
      original_payment_id: params.paymentId,
      retry_attempt: params.retryAttempt,
      card_token: params.cardToken || payment.card_token,
      amount: payment.amount,
      currency: payment.currency,
      reference: `${payment.reference}_retry_${params.retryAttempt}`,
    };

    const response = await fetch(`${this.baseUrl}/api/v1/payments/recurring/retry`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(retryData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TrustPay recovery error: ${error}`);
    }

    const data = await response.json();

    return {
      paymentId: data.payment_id || data.id,
      status: data.status,
      nextRetry: data.status === 'failed' ? nextRetry : undefined,
    };
  }

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/api/v1/subscriptions/${subscriptionId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/api/v1/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancel_immediately: immediately,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TrustPay cancel subscription error: ${error}`);
    }
  }

  // ===========================================================================
  // Customer Management
  // ===========================================================================

  async createCustomer(params: CreateCustomerParams): Promise<Customer> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/api/v1/customers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
      throw new Error(`TrustPay create customer error: ${error}`);
    }

    const data = await response.json();

    return {
      id: data.customer_id || data.id,
      email: params.email,
      provider: 'trustpay',
      metadata: data.metadata,
    };
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/api/v1/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
        provider: 'trustpay',
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
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/api/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
        id: data.payment_id || data.id,
        status: this.mapPaymentStatus(data.status),
        amount: data.amount,
        currency: data.currency || 'EUR',
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
    // TrustPay webhooks are sent as JSON body
    // Signature verification would depend on TrustPay's specific method
    // For now, we'll parse the event and trust the webhook secret validation

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch (error) {
      throw new Error('Invalid webhook payload');
    }

    // Verify signature if provided (TrustPay may use HMAC or other methods)
    // This is a placeholder - actual implementation depends on TrustPay's webhook security

    const eventType = event.type || event.event_type;
    const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();

    // Handle different webhook types: payment, recurring, manual_recurring
    switch (eventType) {
      case 'payment.completed':
      case 'payment.succeeded':
        return {
          id: event.id || event.payment_id,
          type: 'payment.succeeded',
          provider: 'trustpay',
          timestamp,
          raw: event,
          data: {
            invoiceId: event.payment_id || event.id,
            customerId: event.customer_id,
            amount: event.amount,
            currency: event.currency || 'EUR',
          },
        };

      case 'payment.failed':
        return {
          id: event.id || event.payment_id,
          type: 'payment.failed',
          provider: 'trustpay',
          timestamp,
          raw: event,
          data: {
            invoiceId: event.payment_id || event.id,
            customerId: event.customer_id,
            error: event.failure_reason || event.error_message,
          },
        };

      case 'recurring.payment.completed':
      case 'recurring.payment.succeeded':
        return {
          id: event.id || event.payment_id,
          type: 'payment.succeeded',
          provider: 'trustpay',
          timestamp,
          raw: event,
          data: {
            invoiceId: event.payment_id || event.id,
            subscriptionId: event.subscription_id,
            customerId: event.customer_id,
            amount: event.amount,
            currency: event.currency || 'EUR',
          },
        };

      case 'recurring.payment.failed':
        return {
          id: event.id || event.payment_id,
          type: 'payment.failed',
          provider: 'trustpay',
          timestamp,
          raw: event,
          data: {
            invoiceId: event.payment_id || event.id,
            subscriptionId: event.subscription_id,
            customerId: event.customer_id,
            error: event.failure_reason || event.error_message,
          },
        };

      case 'subscription.created':
        return {
          id: event.id || event.subscription_id,
          type: 'subscription.created',
          provider: 'trustpay',
          timestamp,
          raw: event,
          data: {
            subscriptionId: event.subscription_id || event.id,
            customerId: event.customer_id,
            status: this.mapSubscriptionStatus(event.status),
            priceId: event.price_id,
            currentPeriodEnd: event.current_period_end ? new Date(event.current_period_end) : undefined,
          },
        };

      case 'subscription.updated':
        return {
          id: event.id || event.subscription_id,
          type: 'subscription.updated',
          provider: 'trustpay',
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
          provider: 'trustpay',
          timestamp,
          raw: event,
          data: {
            subscriptionId: event.subscription_id || event.id,
            customerId: event.customer_id,
            status: 'cancelled',
            cancelAtPeriodEnd: event.cancel_at_period_end || false,
          },
        };

      case 'chargeback.created':
      case 'chargeback':
        return {
          id: event.id || event.chargeback_id,
          type: 'chargeback.created',
          provider: 'trustpay',
          timestamp,
          raw: event,
          data: {
            chargeId: event.payment_id || event.charge_id,
            subscriptionId: event.subscription_id,
            customerId: event.customer_id,
            amount: event.amount,
            currency: event.currency || 'EUR',
            reason: event.reason || event.chargeback_reason,
          },
        };

      default:
        throw new Error(`Unknown TrustPay webhook event type: ${eventType}`);
    }
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  private generateReference(): string {
    return `TP_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private mapSubscription(data: any): Subscription {
    return {
      id: data.subscription_id || data.id,
      userId: data.metadata?.user_id || '',
      customerId: data.customer_id,
      status: this.mapSubscriptionStatus(data.status),
      priceId: data.price_id || '',
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
      suspended: 'cancelled', // Map suspended to cancelled
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

