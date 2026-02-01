/**
 * Health Check Endpoint
 * Used by Fly.io/Cloudflare for health checks and monitoring
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return Response.json(
    {
      status: 'ok',
      timestamp: Date.now(),
      service: 'web',
    },
    { status: 200 }
  );
}
