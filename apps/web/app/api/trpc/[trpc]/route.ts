/**
 * tRPC API Route Handler - PROXY TO BACKEND API
 *
 * For Cloudflare Pages Edge Runtime, we proxy tRPC requests to the backend API.
 * This allows the web app to work on both Fly.io (direct) and Cloudflare Pages (proxy).
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ trpc: string }> }
) {
  const { trpc } = await params;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://end.ryla.ai';
  const targetUrl = `${backendUrl}/api/trpc/${trpc}`;

  try {
    // Forward headers, including auth
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Skip host header as it will be wrong
      if (key.toLowerCase() !== 'host') {
        headers.set(key, value);
      }
    });

    // Handle GET requests (queries)
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const queryString = url.search;
      const response = await fetch(`${targetUrl}${queryString}`, {
        method: 'GET',
        headers,
      });

      const data = await response.text();
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type':
            response.headers.get('Content-Type') || 'application/json',
        },
      });
    }

    // Handle POST requests (mutations)
    if (request.method === 'POST') {
      const body = await request.text();
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body,
      });

      const data = await response.text();
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type':
            response.headers.get('Content-Type') || 'application/json',
        },
      });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Failed to proxy tRPC request:', error);
    return NextResponse.json(
      { error: 'Failed to proxy tRPC request' },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
