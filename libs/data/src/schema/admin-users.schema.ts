import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Admin users table - separate from regular users for security
 * Part of EP-050: Admin Authentication & RBAC
 */
export const adminUsers = pgTable('admin_users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('viewer'),
    permissions: jsonb('permissions').$type<string[]>().notNull().default([]),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    lastLoginIp: varchar('last_login_ip', { length: 45 }),
    failedLoginAttempts: varchar('failed_login_attempts', { length: 10 }).notNull().default('0'),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
}, (table) => [
    index('admin_users_email_idx').on(table.email),
    index('admin_users_role_idx').on(table.role),
    index('admin_users_is_active_idx').on(table.isActive),
]);

/**
 * Admin roles enum values
 */
export const ADMIN_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    SUPPORT: 'support',
    MODERATOR: 'moderator',
    VIEWER: 'viewer',
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

/**
 * Admin permissions enum values
 */
export const ADMIN_PERMISSIONS = {
    // User management
    USERS_READ: 'users:read',
    USERS_WRITE: 'users:write',
    USERS_DELETE: 'users:delete',

    // Billing
    BILLING_READ: 'billing:read',
    BILLING_WRITE: 'billing:write',
    BILLING_REFUND: 'billing:refund',

    // Bug reports
    BUGS_READ: 'bugs:read',
    BUGS_WRITE: 'bugs:write',

    // Content moderation
    CONTENT_READ: 'content:read',
    CONTENT_WRITE: 'content:write',
    CONTENT_DELETE: 'content:delete',

    // Analytics
    ANALYTICS_READ: 'analytics:read',

    // Content library
    LIBRARY_READ: 'library:read',
    LIBRARY_WRITE: 'library:write',
    LIBRARY_DELETE: 'library:delete',

    // Settings
    SETTINGS_READ: 'settings:read',
    SETTINGS_WRITE: 'settings:write',

    // Admin management
    ADMINS_READ: 'admins:read',
    ADMINS_WRITE: 'admins:write',
} as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];

/**
 * Default permissions per role
 */
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
    super_admin: ['*'] as unknown as AdminPermission[], // All permissions
    admin: [
        ADMIN_PERMISSIONS.USERS_READ,
        ADMIN_PERMISSIONS.USERS_WRITE,
        ADMIN_PERMISSIONS.BILLING_READ,
        ADMIN_PERMISSIONS.BILLING_WRITE,
        ADMIN_PERMISSIONS.BILLING_REFUND,
        ADMIN_PERMISSIONS.BUGS_READ,
        ADMIN_PERMISSIONS.BUGS_WRITE,
        ADMIN_PERMISSIONS.CONTENT_READ,
        ADMIN_PERMISSIONS.CONTENT_WRITE,
        ADMIN_PERMISSIONS.CONTENT_DELETE,
        ADMIN_PERMISSIONS.ANALYTICS_READ,
        ADMIN_PERMISSIONS.LIBRARY_READ,
        ADMIN_PERMISSIONS.LIBRARY_WRITE,
        ADMIN_PERMISSIONS.SETTINGS_READ,
    ],
    support: [
        ADMIN_PERMISSIONS.USERS_READ,
        ADMIN_PERMISSIONS.USERS_WRITE,
        ADMIN_PERMISSIONS.BILLING_READ,
        ADMIN_PERMISSIONS.BILLING_WRITE,
        ADMIN_PERMISSIONS.BUGS_READ,
        ADMIN_PERMISSIONS.BUGS_WRITE,
        ADMIN_PERMISSIONS.CONTENT_READ,
    ],
    moderator: [
        ADMIN_PERMISSIONS.CONTENT_READ,
        ADMIN_PERMISSIONS.CONTENT_WRITE,
        ADMIN_PERMISSIONS.CONTENT_DELETE,
        ADMIN_PERMISSIONS.BUGS_READ,
    ],
    viewer: [
        ADMIN_PERMISSIONS.USERS_READ,
        ADMIN_PERMISSIONS.BILLING_READ,
        ADMIN_PERMISSIONS.BUGS_READ,
        ADMIN_PERMISSIONS.CONTENT_READ,
        ADMIN_PERMISSIONS.ANALYTICS_READ,
        ADMIN_PERMISSIONS.LIBRARY_READ,
    ],
};

/**
 * Admin sessions table for JWT token blacklisting
 */
export const adminSessions = pgTable('admin_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index('admin_sessions_admin_id_idx').on(table.adminId),
    index('admin_sessions_token_hash_idx').on(table.tokenHash),
    index('admin_sessions_expires_at_idx').on(table.expiresAt),
]);

/**
 * Admin audit log for tracking all admin actions
 */
export const adminAuditLog = pgTable('admin_audit_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').notNull().references(() => adminUsers.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: uuid('entity_id'),
    details: jsonb('details').$type<Record<string, unknown>>(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index('admin_audit_log_admin_id_idx').on(table.adminId),
    index('admin_audit_log_action_idx').on(table.action),
    index('admin_audit_log_entity_type_idx').on(table.entityType),
    index('admin_audit_log_created_at_idx').on(table.createdAt),
]);

// Relations
export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
    sessions: many(adminSessions),
    auditLogs: many(adminAuditLog),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
    admin: one(adminUsers, {
        fields: [adminSessions.adminId],
        references: [adminUsers.id],
    }),
}));

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
    admin: one(adminUsers, {
        fields: [adminAuditLog.adminId],
        references: [adminUsers.id],
    }),
}));

// Types
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
export type NewAdminSession = typeof adminSessions.$inferInsert;
export type AdminAuditLogEntry = typeof adminAuditLog.$inferSelect;
export type NewAdminAuditLogEntry = typeof adminAuditLog.$inferInsert;
