import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { createDrizzleDb, adminUsers } from '@ryla/data';
import { getAdminDbConfig } from '@/lib/db-config';

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production';

interface JWTPayload {
  sub: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    let payload: JWTPayload;
    try {
      payload = verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Look up admin in database
    const db = createDrizzleDb(getAdminDbConfig());
    const admin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, payload.sub),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { message: 'Admin not found or inactive' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: (admin.permissions as string[]) || [],
        avatarUrl: admin.avatarUrl || undefined,
      },
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { message: 'An error occurred during validation' },
      { status: 500 }
    );
  }
}
