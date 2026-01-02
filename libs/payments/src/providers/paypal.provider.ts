import type {
  PaymentProvider,
  PayPalConfig,
  CheckoutSessionParams,
  CheckoutSession,
  Subscription,
  PaymentEvent,
  Customer,
  CreateCustomerParams,
  PaymentStatus,
} from '../types';

/**
 * PayPal payment provider implementation
 * Supports both one-time payments and subscriptions
 */
export class PayPalProvider implements PaymentProvider {
  readonly type = 'paypal' as const;
  private readonly client: any; // PayPalHttpClient
  private readonly webhookId: string;
  private readonly baseUrl: string;
  private accessTokenCache?: { token: string; expiresAt: number };

  constructor(config: PayPalConfig) {
    // Lazy load PayPal SDK
    let paypal: any;
    try {
      paypal = require('@paypal/checkout-server-sdk');
    } catch {
      throw new Error('@paypal/checkout-server-sdk is not installed. Install it to use PayPalProvider.');
    }
    
    this.webhookId = config.webhookId;
    this.baseUrl = config.url;
    this.client = new paypal.core.PayPalHttpClient(this.getEnvironment(config, paypal));
  }

  // ===========================================================================
  // Checkout
  // ===========================================================================

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    const accessToken = await this.getAccessToken();
    const isSubscription = params.metadata?.isSubscription === 'true';

    if (isSubscription) {
      // Create subscription
      const subscriptionData = {
        plan_id: params.priceId,
        application_context: {
          brand_name: 'RYLA',
          user_action: 'SUBSCRIBE_NOW',
          return_url: params.successUrl,
          cancel_url: params.cancelUrl,
        },
      };

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`PayPal subscription error: ${error}`);
      }

      const data = await response.json();
      const approveLink = data.links?.find((link: any) => link.rel === 'approve')?.href;

      if (!approveLink) {
        throw new Error('PayPal approve link not found');
      }

      return {
        id: data.id,
        url: approveLink,
        provider: 'paypal',
      };
    } else {
      // Lazy load PayPal SDK
      let paypal: any;
      try {
        paypal = require('@paypal/checkout-server-sdk');
      } catch {
        throw new Error('@paypal/checkout-server-sdk is not installed.');
      }
      
      // Create one-time order
      const request = new paypal.orders.OrdersCreateRequest();
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: this.formatAmount(params.amount || 0),
            },
          },
        ],
        application_context: {
          return_url: params.successUrl,
          cancel_url: params.cancelUrl,
        },
      });

      const response = await this.client.execute(request);
      const approveLink = response.result.links?.find(
        (link: any) => link.rel === 'approve'
      )?.href;

      if (!approveLink) {
        throw new Error('PayPal approve link not found');
      }

      return {
        id: response.result.id,
        url: approveLink,
        provider: 'paypal',
      };
    }
  }

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`PayPal getSubscription error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        userId: data.subscriber?.email_address || '',
        customerId: data.subscriber?.payer_id || '',
        status: this.mapStatus(data.status),
        priceId: data.plan_id || '',
        planId: data.plan_id || '',
        currentPeriodStart: data.billing_info?.last_payment?.time
          ? new Date(data.billing_info.last_payment.time)
          : new Date(),
        currentPeriodEnd: data.billing_info?.next_billing_time
          ? new Date(data.billing_info.next_billing_time)
          : new Date(),
        cancelAtPeriodEnd: data.status === 'CANCELLED',
        cancelledAt: data.status === 'CANCELLED' ? new Date() : undefined,
      };
    } catch (error) {
      if ((error as any).response?.status === 404) return null;
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<void> {
    const accessToken = await this.getAccessToken();

    if (immediately) {
      await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Cancelled by user' }),
      });
    } else {
      // Cancel at period end - PayPal handles this via subscription update
      await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            op: 'replace',
            path: '/status',
            value: 'CANCEL',
          },
        ]),
      });
    }
  }

  // ===========================================================================
  // Customer Management
  // ===========================================================================

  async createCustomer(params: CreateCustomerParams): Promise<Customer> {
    // PayPal doesn't have a separate customer creation API
    // Customers are created implicitly when they subscribe
    // Return a placeholder customer object
    return {
      id: params.email, // Use email as ID for PayPal
      email: params.email,
      provider: 'paypal',
      metadata: params.metadata,
    };
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    // PayPal doesn't have a customer API
    // Return null or use subscription data to infer customer
    return null;
  }

  // ===========================================================================
  // Payment Status
  // ===========================================================================

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/v1/payments/captures/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`PayPal getPaymentStatus error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        status: this.mapPaymentStatus(data.status),
        amount: parseFloat(data.amount.value) * 100, // Convert to cents
        currency: data.amount.currency_code,
        paidAt: data.create_time ? new Date(data.create_time) : undefined,
      };
    } catch (error) {
      if ((error as any).response?.status === 404) return null;
      throw error;
    }
  }

  // ===========================================================================
  // Refunds
  // ===========================================================================

  async refundPayment(captureId: string, amount?: number): Promise<void> {
    // Lazy load PayPal SDK
    let paypal: any;
    try {
      paypal = require('@paypal/checkout-server-sdk');
    } catch {
      throw new Error('@paypal/checkout-server-sdk is not installed.');
    }
    
    const accessToken = await this.getAccessToken();
    const request = new paypal.payments.CapturesRefundRequest(captureId);

    if (amount) {
      request.requestBody({
        amount: {
          value: this.formatAmount(amount),
          currency_code: 'USD',
        },
        note_to_payer: 'Refund for your purchase',
      });
    }

    await this.client.execute(request);
  }

  // ===========================================================================
  // Webhooks
  // ===========================================================================

  async parseWebhookEvent(rawBody: string, signature: string): Promise<PaymentEvent> {
    // PayPal webhook verification requires multiple headers
    // For now, we'll parse the event and verify separately
    const event = JSON.parse(rawBody) as PayPalWebhookEvent;
    return this.mapWebhookEvent(event);
  }

  /**
   * Verify PayPal webhook signature
   * Requires transmission headers from PayPal
   */
  async verifyWebhook(
    transmissionId: string,
    transmissionTime: string,
    transmissionSig: string,
    authAlgo: string,
    certUrl: string,
    webhookEvent: any
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transmission_id: transmissionId,
            transmission_time: transmissionTime,
            transmission_sig: transmissionSig,
            auth_algo: authAlgo,
            cert_url: certUrl,
            webhook_id: this.webhookId,
            webhook_event: webhookEvent,
          }),
        }
      );

      const data = await response.json();
      return data.verification_status === 'SUCCESS';
    } catch (error) {
      return false;
    }
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  private getEnvironment(config: PayPalConfig, paypal: any): any {
    const isSandbox = config.environment === 'sandbox' || config.url.includes('sandbox');
    if (isSandbox) {
      return new paypal.core.SandboxEnvironment(config.clientId, config.clientSecret);
    }
    return new paypal.core.LiveEnvironment(config.clientId, config.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    // Check cache
    if (this.accessTokenCache && this.accessTokenCache.expiresAt > Date.now()) {
      return this.accessTokenCache.token;
    }

    // Lazy load PayPal SDK
    let paypal: any;
    try {
      paypal = require('@paypal/checkout-server-sdk');
    } catch {
      throw new Error('@paypal/checkout-server-sdk is not installed.');
    }

    // Request new token
    const environment = this.getEnvironment({
      clientId: '',
      clientSecret: '',
      webhookId: this.webhookId,
      url: this.baseUrl,
    } as PayPalConfig, paypal);

    const request = new paypal.core.AccessTokenRequest(environment);
    const response = await this.client.execute(request);

    const token = response.result.access_token;
    const expiresIn = response.result.expires_in || 32400; // Default 9 hours

    // Cache token (expire 5 minutes before actual expiry)
    this.accessTokenCache = {
      token,
      expiresAt: Date.now() + (expiresIn - 300) * 1000,
    };

    return token;
  }

  private formatAmount(amountInCents: number): string {
    return (amountInCents / 100).toFixed(2);
  }

  private mapStatus(status: string): Subscription['status'] {
    const statusMap: Record<string, Subscription['status']> = {
      ACTIVE: 'active',
      CANCELLED: 'cancelled',
      SUSPENDED: 'past_due',
      EXPIRED: 'cancelled',
    };
    return statusMap[status] || 'active';
  }

  private mapPaymentStatus(status: string): PaymentStatus['status'] {
    const statusMap: Record<string, PaymentStatus['status']> = {
      COMPLETED: 'paid',
      PENDING: 'pending',
      DECLINED: 'failed',
      PARTIALLY_REFUNDED: 'refunded',
      REFUNDED: 'refunded',
    };
    return statusMap[status] || 'pending';
  }

  private mapWebhookEvent(event: PayPalWebhookEvent): PaymentEvent {
    const baseEvent = {
      id: event.id,
      provider: 'paypal' as const,
      timestamp: new Date(event.create_time),
      raw: event,
    };

    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        return {
          ...baseEvent,
          type: 'checkout.completed',
          data: {
            userId: event.resource?.payer?.payer_id || '',
            customerId: event.resource?.payer?.payer_id || '',
            subscriptionId: '',
            priceId: '',
            email: event.resource?.payer?.email_address,
          },
        };

      case 'BILLING.SUBSCRIPTION.CREATED':
        return {
          ...baseEvent,
          type: 'subscription.created',
          data: {
            subscriptionId: event.resource.id,
            customerId: event.resource.subscriber?.payer_id || '',
            status: this.mapStatus(event.resource.status || ''),
            priceId: event.resource.plan_id,
          },
        };

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        return {
          ...baseEvent,
          type: 'subscription.activated',
          data: {
            subscriptionId: event.resource.id,
            customerId: event.resource.subscriber?.payer_id || '',
            status: 'active',
            priceId: event.resource.plan_id,
          },
        };

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        return {
          ...baseEvent,
          type: 'subscription.suspended',
          data: {
            subscriptionId: event.resource.id,
            customerId: event.resource.subscriber?.payer_id || '',
            status: 'past_due',
            priceId: event.resource.plan_id,
          },
        };

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        return {
          ...baseEvent,
          type: 'subscription.cancelled',
          data: {
            subscriptionId: event.resource.id,
            customerId: event.resource.subscriber?.payer_id || '',
            status: 'cancelled',
            priceId: event.resource.plan_id,
          },
        };

      case 'PAYMENT.SALE.COMPLETED':
      case 'PAYMENT.CAPTURE.COMPLETED':
        return {
          ...baseEvent,
          type: 'payment.succeeded',
          data: {
            invoiceId: event.resource.id || '',
            subscriptionId: event.resource.billing_agreement_id,
            customerId: event.resource.payer_id || '',
            amount: parseFloat(event.resource.amount?.value || '0') * 100,
            currency: event.resource.amount?.currency_code || 'USD',
          },
        };

      case 'PAYMENT.SALE.DENIED':
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        return {
          ...baseEvent,
          type: 'payment.failed',
          data: {
            invoiceId: event.resource.id || '',
            subscriptionId: event.resource.billing_agreement_id,
            customerId: event.resource.payer_id || '',
            error: event.resource.reason_code || 'Payment failed',
          },
        };

      case 'CUSTOMER.DISPUTE.CREATED':
      case 'CUSTOMER.DISPUTE.RESOLVED':
        return {
          ...baseEvent,
          type: 'chargeback.created',
          data: {
            chargeId: ((event.resource as any).disputed_transactions?.[0]?.transaction_id) || event.resource.id,
            subscriptionId: ((event.resource as any).disputed_transactions?.[0]?.seller_transaction_id),
            customerId: ((event.resource as any).disputed_transactions?.[0]?.seller_protection?.status) || '',
            amount: parseFloat(((event.resource as any).dispute_amount?.value) || '0') * 100,
            currency: ((event.resource as any).dispute_amount?.currency_code) || 'USD',
            reason: ((event.resource as any).reason) || ((event.resource as any).dispute_life_cycle_stage),
          },
        };

      default:
        throw new Error(`Unhandled PayPal event type: ${event.event_type}`);
    }
  }
}

// ===========================================================================
// PayPal API Types
// ===========================================================================

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  create_time: string;
  resource: {
    id: string;
    status?: string;
    plan_id?: string;
    billing_agreement_id?: string;
    payer_id?: string;
    subscriber?: {
      payer_id?: string;
      email_address?: string;
    };
    payer?: {
      payer_id?: string;
      email_address?: string;
    };
    amount?: {
      value: string;
      currency_code: string;
    };
    reason_code?: string;
  };
}

