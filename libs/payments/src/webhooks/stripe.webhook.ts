import type { PaymentEvent, CheckoutCompletedEvent, SubscriptionEvent, PaymentSucceededEvent, PaymentFailedEvent, RefundEvent } from '../types';
import { StripeProvider } from '../providers/stripe.provider';

export interface StripeWebhookHandlerOptions {
  secretKey: string;
  webhookSecret: string;
  onCheckoutCompleted?: (event: CheckoutCompletedEvent) => Promise<void>;
  onSubscriptionCreated?: (event: SubscriptionEvent) => Promise<void>;
  onSubscriptionUpdated?: (event: SubscriptionEvent) => Promise<void>;
  onSubscriptionCancelled?: (event: SubscriptionEvent) => Promise<void>;
  onSubscriptionRenewed?: (event: SubscriptionEvent) => Promise<void>;
  onPaymentSucceeded?: (event: PaymentSucceededEvent) => Promise<void>;
  onPaymentFailed?: (event: PaymentFailedEvent) => Promise<void>;
  onRefundCreated?: (event: RefundEvent) => Promise<void>;
  onError?: (error: Error, rawBody: string) => void;
}

/**
 * Create a Stripe webhook handler for Next.js API routes
 *
 * @example
 * // app/api/webhooks/stripe/route.ts
 * import { createStripeWebhookHandler } from '@ryla/payments';
 *
 * const handler = createStripeWebhookHandler({
 *   secretKey: process.env.STRIPE_SECRET_KEY!,
 *   webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
 *   onCheckoutCompleted: async (event) => {
 *     await db.update(users).set({ isPro: true }).where(eq(users.id, event.data.userId));
 *   },
 *   onSubscriptionCancelled: async (event) => {
 *     await db.update(users).set({ isPro: false }).where(eq(users.stripeSubscriptionId, event.data.subscriptionId));
 *   },
 * });
 *
 * export async function POST(request: Request) {
 *   const rawBody = await request.text();
 *   const signature = request.headers.get('stripe-signature')!;
 *   return handler(rawBody, signature);
 * }
 */
export function createStripeWebhookHandler(options: StripeWebhookHandlerOptions) {
  const provider = new StripeProvider({
    secretKey: options.secretKey,
    webhookSecret: options.webhookSecret,
  });

  return async function handleStripeWebhook(
    rawBody: string,
    signature: string
  ): Promise<Response> {
    try {
      const event = await provider.parseWebhookEvent(rawBody, signature);

      switch (event.type) {
        case 'checkout.completed':
          await options.onCheckoutCompleted?.(event as CheckoutCompletedEvent);
          break;
        case 'subscription.created':
          await options.onSubscriptionCreated?.(event as SubscriptionEvent);
          break;
        case 'subscription.updated':
          await options.onSubscriptionUpdated?.(event as SubscriptionEvent);
          break;
        case 'subscription.cancelled':
          await options.onSubscriptionCancelled?.(event as SubscriptionEvent);
          break;
        case 'subscription.renewed':
          await options.onSubscriptionRenewed?.(event as SubscriptionEvent);
          break;
        case 'payment.succeeded':
          await options.onPaymentSucceeded?.(event as PaymentSucceededEvent);
          break;
        case 'payment.failed':
          await options.onPaymentFailed?.(event as PaymentFailedEvent);
          break;
        case 'refund.created':
          await options.onRefundCreated?.(event as RefundEvent);
          break;
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      options.onError?.(error as Error, rawBody);

      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}
