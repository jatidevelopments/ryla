import type { PaymentSucceededEvent, PaymentFailedEvent } from '../types';
import { FinbyProvider } from '../providers/finby.provider';

export interface FinbyV3WebhookHandlerOptions {
  projectId: string;
  secretKey: string;
  onPaymentSucceeded?: (event: PaymentSucceededEvent) => Promise<void>;
  onPaymentFailed?: (event: PaymentFailedEvent) => Promise<void>;
  onError?: (error: Error, rawBody: string) => void;
}

/**
 * Create a Finby API v3 webhook handler for Next.js API routes
 * 
 * Finby API v3 sends notifications as URL query parameters (GET) or JSON body (POST)
 * 
 * @example
 * // app/api/finby/notification/route.ts
 * import { createFinbyV3WebhookHandler } from '@ryla/payments';
 * 
 * const handler = createFinbyV3WebhookHandler({
 *   projectId: process.env.FINBY_PROJECT_ID!,
 *   secretKey: process.env.FINBY_SECRET_KEY!,
 *   onPaymentSucceeded: async (event) => {
 *     // Grant credits, update subscription, etc.
 *   },
 * });
 * 
 * export async function POST(request: Request) {
 *   const rawBody = await request.text();
 *   const url = new URL(request.url);
 *   const signature = url.searchParams.get('Signature') || '';
 *   return handler(rawBody, signature);
 * }
 * 
 * export async function GET(request: Request) {
 *   return POST(request); // Finby may send via GET
 * }
 */
export function createFinbyV3WebhookHandler(options: FinbyV3WebhookHandlerOptions) {
  const provider = new FinbyProvider({
    projectId: options.projectId,
    secretKey: options.secretKey,
    apiVersion: 'v3',
  });

  return async function handleFinbyV3Webhook(
    rawBody: string,
    signature: string
  ): Promise<Response> {
    try {
      const event = await provider.parseWebhookEvent(rawBody, signature);

      switch (event.type) {
        case 'payment.succeeded':
          await options.onPaymentSucceeded?.(event as PaymentSucceededEvent);
          break;
        case 'payment.failed':
          await options.onPaymentFailed?.(event as PaymentFailedEvent);
          break;
      }

      // Return 200 OK to acknowledge receipt
      // Finby will retry if it doesn't receive 200 OK
      return new Response(JSON.stringify({ status: 'received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      options.onError?.(error as Error, rawBody);

      // Return 500 so Finby will retry
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

