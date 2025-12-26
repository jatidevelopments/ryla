import Stripe from 'stripe';
import type {
  PaymentProvider,
  StripeConfig,
  CheckoutSessionParams,
  CheckoutSession,
  Subscription,
  SubscriptionStatus,
  PaymentEvent,
} from '../types';

/**
 * Stripe payment provider implementation
 */
export class StripeProvider implements PaymentProvider {
  readonly type = 'stripe' as const;
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      typescript: true,
    });
    this.webhookSecret = config.webhookSecret;
  }

  // ===========================================================================
  // Checkout
  // ===========================================================================

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    // Default to subscription mode for backward compatibility
    const mode = params.mode || 'subscription';
    
    const session = await this.stripe.checkout.sessions.create({
      mode: mode as 'subscription' | 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.email,
      allow_promotion_codes: params.allowPromotionCodes ?? true,
      metadata: {
        user_id: params.userId,
        ...params.metadata,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return {
      id: session.id,
      url: session.url,
      provider: 'stripe',
    };
  }

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const sub = await this.stripe.subscriptions.retrieve(subscriptionId);
      return this.mapSubscription(sub);
    } catch (error) {
      if ((error as Stripe.errors.StripeError).code === 'resource_missing') {
        return null;
      }
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<void> {
    if (immediately) {
      await this.stripe.subscriptions.cancel(subscriptionId);
    } else {
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  // ===========================================================================
  // Billing Portal
  // ===========================================================================

  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<string> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }

  // ===========================================================================
  // Refunds
  // ===========================================================================

  async refundPayment(paymentIntentId: string, amount?: number): Promise<void> {
    await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount,
    });
  }

  // ===========================================================================
  // Webhooks
  // ===========================================================================

  async parseWebhookEvent(rawBody: string, signature: string): Promise<PaymentEvent> {
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    return this.mapWebhookEvent(event);
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  private mapSubscription(sub: Stripe.Subscription): Subscription {
    const item = sub.items.data[0];
    return {
      id: sub.id,
      userId: (sub.metadata?.['user_id'] as string) || '',
      customerId: sub.customer as string,
      status: this.mapStatus(sub.status),
      priceId: item?.price?.id || '',
      planId: item?.price?.product as string || '',
      currentPeriodStart: new Date((sub as unknown as { current_period_start: number }).current_period_start * 1000),
      currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      cancelledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
    };
  }

  private mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
      active: 'active',
      canceled: 'cancelled',
      past_due: 'past_due',
      unpaid: 'unpaid',
      trialing: 'trialing',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
      paused: 'active', // Map paused to active for simplicity
    };
    return statusMap[status] || 'active';
  }

  private mapWebhookEvent(event: Stripe.Event): PaymentEvent {
    const baseEvent = {
      id: event.id,
      provider: 'stripe' as const,
      timestamp: new Date(event.created * 1000),
      raw: event,
    };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          ...baseEvent,
          type: 'checkout.completed',
          data: {
            userId: session.metadata?.['user_id'] || '',
            customerId: session.customer as string,
            subscriptionId: session.subscription as string,
            priceId: '', // Would need to fetch subscription for this
            email: session.customer_email || undefined,
          },
        };
      }

      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const currentPeriodEnd = (sub as unknown as { current_period_end: number }).current_period_end;
        return {
          ...baseEvent,
          type: 'subscription.created',
          data: {
            subscriptionId: sub.id,
            customerId: sub.customer as string,
            status: this.mapStatus(sub.status),
            priceId: sub.items.data[0]?.price?.id,
            currentPeriodEnd: new Date(currentPeriodEnd * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        };
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const subWithPeriods = sub as unknown as { current_period_start: number; current_period_end: number };
        const isRenewal = sub.created !== subWithPeriods.current_period_start;
        return {
          ...baseEvent,
          type: isRenewal ? 'subscription.renewed' : 'subscription.updated',
          data: {
            subscriptionId: sub.id,
            customerId: sub.customer as string,
            status: this.mapStatus(sub.status),
            priceId: sub.items.data[0]?.price?.id,
            currentPeriodEnd: new Date(subWithPeriods.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        };
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        return {
          ...baseEvent,
          type: 'subscription.cancelled',
          data: {
            subscriptionId: sub.id,
            customerId: sub.customer as string,
            status: 'cancelled',
          },
        };
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceWithSub = invoice as unknown as { subscription?: string };
        return {
          ...baseEvent,
          type: 'payment.succeeded',
          data: {
            invoiceId: invoice.id || '',
            subscriptionId: invoiceWithSub.subscription,
            customerId: invoice.customer as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
          },
        };
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceWithSub = invoice as unknown as { subscription?: string };
        return {
          ...baseEvent,
          type: 'payment.failed',
          data: {
            invoiceId: invoice.id || '',
            subscriptionId: invoiceWithSub.subscription,
            customerId: invoice.customer as string,
            error: invoice.last_finalization_error?.message,
          },
        };
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        return {
          ...baseEvent,
          type: 'refund.created',
          data: {
            refundId: charge.refunds?.data[0]?.id || '',
            chargeId: charge.id,
            amount: charge.amount_refunded,
            currency: charge.currency,
          },
        };
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = dispute.charge as Stripe.Charge;
        return {
          ...baseEvent,
          type: 'chargeback.created',
          data: {
            chargeId: typeof charge === 'string' ? charge : charge.id,
            customerId: typeof charge === 'string' ? '' : (charge.customer as string || ''),
            amount: dispute.amount,
            currency: dispute.currency,
            reason: dispute.reason || dispute.evidence?.summary,
          },
        };
      }

      default:
        throw new Error(`Unhandled Stripe event type: ${event.type}`);
    }
  }
}
