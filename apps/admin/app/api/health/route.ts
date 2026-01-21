import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Fly.io
 * 
 * Returns 200 OK if the app is running.
 * Used by Fly.io health checks configured in fly.toml
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'admin',
    },
    { status: 200 }
  );
}
