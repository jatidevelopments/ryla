import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      deployment_id?: string;
      prompt?: string;
      seed?: number;
      overrides?: Record<string, { inputs: Record<string, unknown> }>;
    };
    if (!body?.deployment_id) {
      return NextResponse.json({ error: 'deployment_id is required' }, { status: 400 });
    }

    const res = await fetch(`${API_BASE}/playground/runcomfy/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
