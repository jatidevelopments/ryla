import { NextRequest, NextResponse } from 'next/server';

/**
 * Finby Recurring Webhook Handler - PROXY TO BACKEND API
 *
 * Recurring webhooks should be configured to point to the backend API directly:
 * https://end.ryla.ai/payments/recurring-webhook
 *
 * This route exists for backward compatibility and forwards to the backend.
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://end.ryla.ai';
  const body = await request.text();

  try {
    const response = await fetch(`${backendUrl}/payments/recurring-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'X-Forwarded-For': request.headers.get('X-Forwarded-For') || '',
      },
      body,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to forward recurring webhook to backend:', error);
    return NextResponse.json(
      { error: 'Failed to forward webhook' },
      { status: 502 }
    );
  }
}
