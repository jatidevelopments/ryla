/**
 * Health Check Endpoint
 * Used by Fly.io for health checks and monitoring
 *
 * Note: For Cloudflare Pages (static export), API routes are not supported.
 * This route will be skipped during static export builds.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return Response.json(
    {
      status: 'ok',
      timestamp: Date.now(),
      service: 'landing',
    },
    { status: 200 }
  );
}
