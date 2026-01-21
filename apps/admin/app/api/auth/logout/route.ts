import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // TODO: Add token to blacklist when using Redis
  // TODO: Log logout event to audit log
  
  return NextResponse.json({ success: true });
}
