/**
 * Admin Users Router
 *
 * Provides admin user management operations for super_admin only.
 * Part of EP-057: Advanced Admin Operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import { adminUsers, adminAuditLog, ROLE_PERMISSIONS } from '@ryla/data';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';

/**
 * List admin users schema
 */
const listAdminsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'support', 'moderator', 'viewer']).optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'lastLoginAt', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Create admin user schema
 */
const createAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: z.enum(['super_admin', 'admin', 'support', 'moderator', 'viewer']),
  password: z.string().min(8).max(100),
  isActive: z.boolean().default(true),
});

/**
 * Update admin user schema
 */
const updateAdminSchema = z.object({
  adminId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  role: z.enum(['super_admin', 'admin', 'support', 'moderator', 'viewer']).optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Reset password schema
 */
const resetPasswordSchema = z.object({
  adminId: z.string().uuid(),
  newPassword: z.string().min(8).max(100),
});

/**
 * Delete admin user schema
 */
const deleteAdminSchema = z.object({
  adminId: z.string().uuid(),
  reason: z.string().min(1).max(500).optional(),
});

export const adminsRouter = router({
  /**
   * List admin users with pagination, search, and filters
   * Only super_admin can access
   */
  list: protectedProcedure
    .input(listAdminsSchema)
    .query(async ({ ctx, input }) => {
      const { db, admin } = ctx;

      // Only super_admin can list admins
      if (admin.role !== 'super_admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super_admin can list admin users',
        });
      }

      const {
        limit,
        offset,
        search,
        role,
        isActive,
        sortBy,
        sortOrder,
      } = input;

      const conditions = [];

      if (role) {
        conditions.push(eq(adminUsers.role, role));
      }

      if (isActive !== undefined) {
        conditions.push(eq(adminUsers.isActive, isActive));
      }

      if (search) {
        conditions.push(
          or(
            ilike(adminUsers.email, `%${search}%`),
            ilike(adminUsers.name, `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(adminUsers)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get admin users
      const adminList = await db.query.adminUsers.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy:
          sortBy === 'createdAt'
            ? sortOrder === 'desc'
              ? [desc(adminUsers.createdAt)]
              : [adminUsers.createdAt]
            : sortBy === 'lastLoginAt'
              ? sortOrder === 'desc'
                ? [desc(adminUsers.lastLoginAt)]
                : [adminUsers.lastLoginAt]
              : sortOrder === 'desc'
                ? [desc(adminUsers.email)]
                : [adminUsers.email],
        columns: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          avatarUrl: true,
          isActive: true,
          lastLoginAt: true,
          lastLoginIp: true,
          failedLoginAttempts: true,
          lockedUntil: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          // Exclude password hash
        },
      });

      return {
        admins: adminList,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get admin user by ID
   */
  get: protectedProcedure
    .input(z.object({ adminId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { adminId } = input;

      // Only super_admin can view other admins
      if (admin.role !== 'super_admin' && admin.id !== adminId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super_admin can view other admin users',
        });
      }

      const adminUser = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.id, adminId),
        columns: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          avatarUrl: true,
          isActive: true,
          lastLoginAt: true,
          lastLoginIp: true,
          failedLoginAttempts: true,
          lockedUntil: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
        },
      });

      if (!adminUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Admin user not found' });
      }

      return adminUser;
    }),

  /**
   * Create a new admin user
   * Only super_admin can create admins
   */
  create: protectedProcedure
    .input(createAdminSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;

      // Only super_admin can create admins
      if (admin.role !== 'super_admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super_admin can create admin users',
        });
      }

      // Check if email already exists
      const existing = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.email, input.email),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Admin user with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Get permissions for role
      const permissions = ROLE_PERMISSIONS[input.role] || [];

      // Create admin user
      const newAdmin = await db
        .insert(adminUsers)
        .values({
          email: input.email,
          name: input.name,
          passwordHash,
          role: input.role,
          permissions,
          isActive: input.isActive,
          createdBy: admin.id,
        })
        .returning();

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'create',
        entityType: 'admin_user',
        entityId: newAdmin[0].id,
        details: {
          email: input.email,
          name: input.name,
          role: input.role,
          createdBy: admin.id,
        },
      });

      return {
        id: newAdmin[0].id,
        email: newAdmin[0].email,
        name: newAdmin[0].name,
        role: newAdmin[0].role,
        permissions: newAdmin[0].permissions,
        isActive: newAdmin[0].isActive,
        createdAt: newAdmin[0].createdAt,
      };
    }),

  /**
   * Update an admin user
   * Only super_admin can update other admins
   */
  update: protectedProcedure
    .input(updateAdminSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { adminId, ...updates } = input;

      // Only super_admin can update other admins
      if (admin.role !== 'super_admin' && admin.id !== adminId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super_admin can update other admin users',
        });
      }

      // Cannot update self's role or active status
      if (admin.id === adminId && (updates.role || updates.isActive !== undefined)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot update your own role or active status',
        });
      }

      // Check if admin exists
      const existing = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.id, adminId),
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Admin user not found' });
      }

      // Check if trying to delete last super_admin
      if (
        existing.role === 'super_admin' &&
        updates.isActive === false &&
        admin.id !== adminId
      ) {
        // Check if there are other super_admins
        const otherSuperAdmins = await db.query.adminUsers.findMany({
          where: and(
            eq(adminUsers.role, 'super_admin'),
            eq(adminUsers.isActive, true),
            sql`${adminUsers.id} != ${adminId}`
          ),
        });

        if (otherSuperAdmins.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot disable the last super_admin',
          });
        }
      }

      // Get permissions if role is being updated
      let permissions = updates.permissions;
      if (updates.role && !permissions) {
        permissions = ROLE_PERMISSIONS[updates.role] || [];
      }

      // Update admin user
      const updated = await db
        .update(adminUsers)
        .set({
          ...updates,
          permissions: permissions || undefined,
          updatedAt: new Date(),
        })
        .where(eq(adminUsers.id, adminId))
        .returning();

      if (!updated[0]) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update admin user',
        });
      }

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'admin_user',
        entityId: adminId,
        details: {
          oldValue: existing,
          newValue: updated[0],
          updatedBy: admin.id,
        },
      });

      return {
        id: updated[0].id,
        email: updated[0].email,
        name: updated[0].name,
        role: updated[0].role,
        permissions: updated[0].permissions,
        isActive: updated[0].isActive,
        updatedAt: updated[0].updatedAt,
      };
    }),

  /**
   * Reset admin user password
   * Only super_admin can reset passwords
   */
  resetPassword: protectedProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { adminId, newPassword } = input;

      // Only super_admin can reset passwords
      if (admin.role !== 'super_admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super_admin can reset admin passwords',
        });
      }

      // Check if admin exists
      const existing = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.id, adminId),
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Admin user not found' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await db
        .update(adminUsers)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(adminUsers.id, adminId));

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'admin_user',
        entityId: adminId,
        details: {
          action: 'reset_password',
          updatedBy: admin.id,
        },
      });

      return { success: true };
    }),

  /**
   * Delete (disable) an admin user
   * Only super_admin can delete admins
   */
  delete: protectedProcedure
    .input(deleteAdminSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { adminId, reason } = input;

      // Only super_admin can delete admins
      if (admin.role !== 'super_admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super_admin can delete admin users',
        });
      }

      // Cannot delete self
      if (admin.id === adminId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete your own account',
        });
      }

      // Check if admin exists
      const existing = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.id, adminId),
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Admin user not found' });
      }

      // Check if trying to delete last super_admin
      if (existing.role === 'super_admin') {
        const otherSuperAdmins = await db.query.adminUsers.findMany({
          where: and(
            eq(adminUsers.role, 'super_admin'),
            eq(adminUsers.isActive, true),
            sql`${adminUsers.id} != ${adminId}`
          ),
        });

        if (otherSuperAdmins.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete the last super_admin',
          });
        }
      }

      // Soft delete by disabling
      await db
        .update(adminUsers)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(adminUsers.id, adminId));

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'delete',
        entityType: 'admin_user',
        entityId: adminId,
        details: {
          oldValue: existing,
          newValue: { isActive: false },
          reason,
          deletedBy: admin.id,
        },
      });

      return { success: true };
    }),
});
