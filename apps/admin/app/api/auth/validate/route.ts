import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { createDrizzleDb, adminUsers } from '@ryla/data';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production';

/**
 * Get database configuration from environment
 */
function getDbConfig() {
  const env = process.env['POSTGRES_ENVIRONMENT'] || process.env['NODE_ENV'] || 'development';
  const isLocal = env === 'local' || env === 'development';
  const isProduction = env === 'production';

  return {
    host: process.env['POSTGRES_HOST'] || 'localhost',
    port: Number(process.env['POSTGRES_PORT']) || 5432,
    user: process.env['POSTGRES_USER'] || 'ryla',
    password: process.env['POSTGRES_PASSWORD'] || 'ryla_local_dev',
    database: process.env['POSTGRES_DB'] || 'ryla',
    ssl: isLocal ? false : isProduction ? { rejectUnauthorized: false } : false,
  };
}

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
    const db = createDrizzleDb(getDbConfig());
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
