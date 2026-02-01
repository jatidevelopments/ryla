/**
 * Health Check Endpoint
 * Used by Fly.io/Cloudflare for health checks and monitoring
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: Date.now(),
      service: 'web',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
