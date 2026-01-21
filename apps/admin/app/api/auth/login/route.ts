import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { eq, and, gt } from 'drizzle-orm';
import { createDrizzleDb, adminUsers, adminSessions, adminAuditLog } from '@ryla/data';
import { createHash } from 'crypto';

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

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

/**
 * Hash JWT token for session storage
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  const db = createDrizzleDb(getDbConfig());
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase()),
    });

    if (!admin) {
      // Log failed login attempt
      await db.insert(adminAuditLog).values({
        adminId: null as any, // No admin ID for failed login
        action: 'login_failed',
        entityType: 'admin_user',
        details: { email: email.toLowerCase(), reason: 'user_not_found' },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return NextResponse.json(
        { message: 'Account is locked. Please try again later.' },
        { status: 403 }
      );
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json(
        { message: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = parseInt(admin.failedLoginAttempts || '0', 10) + 1;
      const maxAttempts = 5;
      const lockoutMinutes = 15;

      let lockedUntil: Date | null = null;
      if (failedAttempts >= maxAttempts) {
        lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      }

      await db
        .update(adminUsers)
        .set({
          failedLoginAttempts: failedAttempts.toString(),
          lockedUntil,
          updatedAt: new Date(),
        })
        .where(eq(adminUsers.id, admin.id));

      // Log failed login attempt
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'login_failed',
        entityType: 'admin_user',
        details: { email: admin.email, failedAttempts },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset failed login attempts on successful login
    await db
      .update(adminUsers)
      .set({
        failedLoginAttempts: '0',
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, admin.id));

    // Generate JWT token
    const token = sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const tokenHash = hashToken(token);

    await db.insert(adminSessions).values({
      adminId: admin.id,
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // Log successful login
    await db.insert(adminAuditLog).values({
      adminId: admin.id,
      action: 'login_success',
      entityType: 'admin_user',
      details: { email: admin.email },
      ipAddress,
      userAgent,
    });

    // Get permissions from role or stored permissions
    const permissions = admin.permissions && Array.isArray(admin.permissions) 
      ? admin.permissions 
      : admin.permissions === '*' || admin.role === 'super_admin'
        ? ['*']
        : [];

    return NextResponse.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
