import { NextResponse } from 'next/server';

const API_BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/playground/runcomfy/endpoints`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error ?? `HTTP ${res.status}` },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Request failed: ${message}. Is the API running at ${API_BASE}?` },
      { status: 502 }
    );
  }
}
