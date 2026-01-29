# [EPIC] EP-072: Admin Authentication & RBAC

**Initiative**: [IN-014](../../../initiatives/IN-014-admin-back-office.md) - Admin Back-Office Application  
**Phase**: 1 (MVP)  
**Priority**: P0  
**Status**: Completed

---

## Overview

Implement a secure, separate authentication system for the admin back-office application with role-based access control (RBAC). This uses a dedicated `admin_users` table separate from the main user base for security isolation.

---

## Business Impact

**Target Metric**: E-CAC (Operational Efficiency)

**Hypothesis**: When admin operations are protected by proper authentication and role-based access, we reduce security risk and enable multiple team members to perform operations with appropriate permissions.

**Success Criteria**:

- Admin authentication is completely separate from customer auth
- MFA available for production access
- Audit trail for all admin logins
- Role-based permissions enforced on all endpoints

---

## Features

### F1: Admin User Management (Database)

- Separate `admin_users` table (not shared with customers)
- Password hashing with bcrypt (cost factor 12)
- Role assignment (super_admin, billing_admin, support_admin, content_admin, viewer)
- MFA secret storage (TOTP)
- Account lockout after failed attempts
- Last login tracking

### F2: Admin Login Flow

- Email + password authentication
- Custom JWT tokens (separate from customer tokens)
- Session stored in `admin_sessions` table
- Login rate limiting (5 attempts, then 15-min lockout)
- IP address logging
- User agent logging

### F3: MFA (Two-Factor Authentication)

- TOTP-based MFA (Google Authenticator, Authy compatible)
- MFA setup flow with QR code
- Backup codes generation (10 codes)
- MFA required for production environment
- MFA optional for development

### F4: Session Management

- JWT access tokens (15-minute expiry)
- Refresh tokens (7-day expiry)
- Session listing (see active sessions)
- Session revocation (logout specific device)
- Logout all devices
- Auto-logout on inactivity (30 minutes)

### F5: Role-Based Access Control (RBAC)

- Role definitions with permissions
- Permission checks on all API endpoints
- UI elements hidden based on role
- Role hierarchy (super_admin > billing_admin > viewer)

**Role Permissions Matrix**:

| Permission | super_admin | billing_admin | support_admin | content_admin | viewer |
|------------|-------------|---------------|---------------|---------------|--------|
| View users | ✅ | ✅ | ✅ | ❌ | ✅ |
| Ban/unban users | ✅ | ❌ | ✅ | ❌ | ❌ |
| Add credits | ✅ | ✅ | ❌ | ❌ | ❌ |
| Refund credits | ✅ | ✅ | ❌ | ❌ | ❌ |
| View subscriptions | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manage bug reports | ✅ | ❌ | ✅ | ❌ | ❌ |
| View images | ✅ | ❌ | ✅ | ✅ | ✅ |
| Moderate content | ✅ | ❌ | ✅ | ✅ | ❌ |
| Manage prompts | ✅ | ❌ | ❌ | ✅ | ❌ |
| Manage templates | ✅ | ❌ | ❌ | ✅ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage admin users | ✅ | ❌ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ | ❌ | ❌ |

### F6: Audit Logging

- Log all login attempts (success/failure)
- Log all admin actions
- Store old/new values for data changes
- Queryable audit log
- Export capability

### F7: Password Policies

- Minimum 12 characters
- Must include uppercase, lowercase, number, special char
- Password expiry (90 days)
- Password history (cannot reuse last 5)
- Forced password change on first login

### F8: Protected Routes & Middleware

- All admin routes require authentication
- Role checks on route access
- Session validation on each request
- Graceful handling of expired sessions

---

## Acceptance Criteria

### AC-1: Admin User Database

- [ ] `admin_users` table created with all required fields
- [ ] Passwords hashed with bcrypt (cost 12)
- [ ] Role enum includes all defined roles
- [ ] MFA fields available for TOTP
- [ ] Account lockout fields present

### AC-2: Login Flow

- [ ] Admin can login with email/password
- [ ] Invalid credentials show generic error (no email enumeration)
- [ ] Successful login creates session in database
- [ ] JWT tokens generated and returned
- [ ] Login attempt logged in audit log
- [ ] IP address and user agent recorded

### AC-3: Session Management

- [ ] Access tokens expire after 15 minutes
- [ ] Refresh tokens work for 7 days
- [ ] User can see list of active sessions
- [ ] User can logout specific session
- [ ] User can logout all sessions
- [ ] Expired sessions handled gracefully

### AC-4: MFA

- [ ] Admin can enable MFA from settings
- [ ] QR code displayed for TOTP setup
- [ ] Backup codes generated and shown once
- [ ] MFA required during login when enabled
- [ ] MFA can be disabled (with re-authentication)

### AC-5: RBAC

- [ ] Roles correctly limit API access
- [ ] UI elements hidden based on permissions
- [ ] Unauthorized API calls return 403
- [ ] Role changes take effect immediately

### AC-6: Audit Logging

- [ ] All login attempts logged
- [ ] All data modifications logged
- [ ] Old and new values captured
- [ ] Logs queryable by admin
- [ ] Logs cannot be modified or deleted

### AC-7: Password Policies

- [ ] Password requirements enforced on creation
- [ ] Expired passwords require change
- [ ] Password history prevents reuse
- [ ] Clear error messages for policy violations

### AC-8: Protected Routes

- [ ] All `/admin/*` routes require auth
- [ ] Unauthenticated requests redirect to login
- [ ] Role-based route protection works
- [ ] Session timeout redirects to login

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `admin_login_attempted` | Login form submitted | `email_hash`, `ip`, `success` |
| `admin_login_success` | Successful login | `admin_id`, `role`, `mfa_used` |
| `admin_login_failed` | Failed login | `reason`, `attempts_remaining` |
| `admin_logout` | Logout action | `admin_id`, `session_id` |
| `admin_mfa_enabled` | MFA turned on | `admin_id` |
| `admin_mfa_disabled` | MFA turned off | `admin_id` |
| `admin_session_revoked` | Session terminated | `admin_id`, `target_session_id` |
| `admin_password_changed` | Password updated | `admin_id`, `forced` |
| `admin_account_locked` | Too many failures | `admin_id`, `lockout_until` |

---

## User Stories

### ST-200: Admin Login

**As an** admin user  
**I want to** log in to the admin panel with my credentials  
**So that** I can access back-office operations

**AC**: AC-2, AC-8

### ST-201: Enable MFA

**As an** admin user  
**I want to** enable two-factor authentication  
**So that** my admin account is more secure

**AC**: AC-4

### ST-202: View Active Sessions

**As an** admin user  
**I want to** see all my active sessions  
**So that** I can detect unauthorized access

**AC**: AC-3

### ST-203: Role-Based Access

**As a** super_admin  
**I want to** assign roles to other admin users  
**So that** team members have appropriate permissions

**AC**: AC-5

### ST-204: View Audit Logs

**As a** super_admin  
**I want to** view the audit log of admin actions  
**So that** I can track who did what and when

**AC**: AC-6

---

## Technical Notes

### Database Schema

```typescript
// libs/data/src/schema/admin-users.schema.ts
export const adminRoleEnum = pgEnum('admin_role', [
  'super_admin',
  'billing_admin',
  'support_admin',
  'content_admin',
  'viewer',
]);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: adminRoleEnum('role').notNull().default('viewer'),
  
  // MFA
  mfaEnabled: boolean('mfa_enabled').default(false),
  mfaSecret: text('mfa_secret'),
  mfaBackupCodes: jsonb('mfa_backup_codes').$type<string[]>(),
  
  // Security
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: text('last_login_ip'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  passwordChangedAt: timestamp('password_changed_at'),
  passwordHistory: jsonb('password_history').$type<string[]>(),
  mustChangePassword: boolean('must_change_password').default(true),
  
  // Status
  isActive: boolean('is_active').default(true),
  
  // Audit
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### JWT Structure

```typescript
interface AdminJwtPayload {
  sub: string;           // admin_user_id
  email: string;
  role: AdminRole;
  sessionId: string;
  iat: number;
  exp: number;
  type: 'admin_access' | 'admin_refresh';
}
```

### Auth Middleware

```typescript
// apps/admin/middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_access_token');
  
  if (!token && isProtectedRoute(request.pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Validate token and check role permissions
  const payload = await verifyAdminToken(token.value);
  
  if (!payload) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Check route-level permissions
  const requiredPermission = getRoutePermission(request.pathname);
  if (!hasPermission(payload.role, requiredPermission)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  return NextResponse.next();
}
```

### Permission Helper

```typescript
// libs/shared/src/admin/permissions.ts
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: ['*'], // All permissions
  billing_admin: ['users.view', 'credits.*', 'subscriptions.*', 'analytics.view'],
  support_admin: ['users.*', 'bug_reports.*', 'images.view', 'content.moderate'],
  content_admin: ['images.*', 'prompts.*', 'templates.*', 'content.*'],
  viewer: ['*.view'], // Read-only access
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (rolePermissions.includes('*')) return true;
  
  return rolePermissions.some(p => {
    if (p.endsWith('.*')) {
      return permission.startsWith(p.slice(0, -1));
    }
    if (p === '*.view') {
      return permission.endsWith('.view');
    }
    return p === permission;
  });
}
```

---

## Non-Goals (Phase 2+)

- SSO/SAML integration
- IP allowlist/blocklist
- Hardware key support (WebAuthn)
- Granular permission customization
- Time-based access restrictions

---

## Dependencies

- PostgreSQL database (existing)
- Redis for session caching (optional, for performance)
- TOTP library (otplib or similar)
- bcrypt for password hashing

---

## Security Considerations

1. **Separate from customer auth**: Admin tokens cannot be used on customer APIs
2. **No password in logs**: Never log passwords or tokens
3. **Secure cookie settings**: HttpOnly, Secure, SameSite=Strict
4. **Rate limiting**: Prevent brute force attacks
5. **Audit everything**: All actions logged for forensics

---

## Phase Checklist

- [ ] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
