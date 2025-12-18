import type { CheckoutCompletedEvent, SubscriptionEvent, PaymentSucceededEvent, PaymentFailedEvent } from '../types';
import { FinbyProvider } from '../providers/finby.provider';

export interface FinbyWebhookHandlerOptions {
  apiKey: string;
  merchantId: string;
  webhookSecret?: string;
  onCheckoutCompleted?: (event: CheckoutCompletedEvent) => Promise<void>;
  onSubscriptionCreated?: (event: SubscriptionEvent) => Promise<void>;
  onSubscriptionUpdated?: (event: SubscriptionEvent) => Promise<void>;
  onSubscriptionCancelled?: (event: SubscriptionEvent) => Promise<void>;
  onPaymentSucceeded?: (event: PaymentSucceededEvent) => Promise<void>;
  onPaymentFailed?: (event: PaymentFailedEvent) => Promise<void>;
  onError?: (error: Error, rawBody: string) => void;
}

/**
 * Create a Finby webhook handler for Next.js API routes
 *
 * @example
 * // app/api/webhooks/finby/route.ts
 * import { createFinbyWebhookHandler } from '@ryla/payments';
 *
 * const handler = createFinbyWebhookHandler({
 *   apiKey: process.env.FINBY_API_KEY!,
 *   merchantId: process.env.FINBY_MERCHANT_ID!,
 *   webhookSecret: process.env.FINBY_WEBHOOK_SECRET,
 *   onCheckoutCompleted: async (event) => {
 *     await db.update(users).set({ isPro: true }).where(eq(users.id, event.data.userId));
 *   },
 * });
 *
 * export async function POST(request: Request) {
 *   const rawBody = await request.text();
 *   const signature = request.headers.get('x-finby-signature') || '';
 *   return handler(rawBody, signature);
 * }
 */
export function createFinbyWebhookHandler(options: FinbyWebhookHandlerOptions) {
  const provider = new FinbyProvider({
    apiKey: options.apiKey,
    merchantId: options.merchantId,
    webhookSecret: options.webhookSecret,
  });

  return async function handleFinbyWebhook(
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
        case 'payment.succeeded':
          await options.onPaymentSucceeded?.(event as PaymentSucceededEvent);
          break;
        case 'payment.failed':
          await options.onPaymentFailed?.(event as PaymentFailedEvent);
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
