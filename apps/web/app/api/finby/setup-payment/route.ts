import { NextRequest, NextResponse } from 'next/server';

/**
 * @deprecated This endpoint is deprecated. Use the backend API instead.
 * 
 * The web app should call the backend API at: POST /payments/session
 * This endpoint is kept for backward compatibility but will be removed in a future version.
 * 
 * Backend endpoint: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/payments/session
 * 
 * Migration: Update payment.service.ts to call the backend API directly.
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  console.warn('[DEPRECATED] /api/finby/setup-payment is deprecated. Use backend API /payments/session instead.');

    return NextResponse.json(
      {
      error: 'This endpoint is deprecated. Please use the backend API at /payments/session',
      code: 'DEPRECATED_ENDPOINT',
      message: 'This Next.js API route has been deprecated. Payment processing should be done through the backend API.',
      backendEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/payments/session`,
      },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
    );
  }
