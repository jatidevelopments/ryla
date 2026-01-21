/**
 * Admin Audit Router
 *
 * Provides audit log viewing and search operations for the admin panel.
 * Part of EP-057: Advanced Admin Operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import { adminAuditLog, adminUsers } from '@ryla/data';
import { eq, and, or, ilike, desc, gte, lte, sql } from 'drizzle-orm';

/**
 * List audit logs schema
 */
const listAuditLogsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  adminId: z.string().uuid().optional(),
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
  sortBy: z.enum(['createdAt', 'action']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const auditRouter = router({
  /**
   * List audit logs with pagination, search, and filters
   */
  list: protectedProcedure
    .input(listAuditLogsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const {
        limit,
        offset,
        search,
        action,
        entityType,
        adminId,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      } = input;

      const conditions = [];

      if (action) {
        conditions.push(eq(adminAuditLog.action, action));
      }

      if (entityType) {
        conditions.push(eq(adminAuditLog.entityType, entityType));
      }

      if (adminId) {
        conditions.push(eq(adminAuditLog.adminId, adminId));
      }

      if (dateFrom) {
        conditions.push(gte(adminAuditLog.createdAt, new Date(dateFrom)));
      }

      if (dateTo) {
        conditions.push(lte(adminAuditLog.createdAt, new Date(dateTo)));
      }

      if (search) {
        conditions.push(
          or(
            ilike(adminAuditLog.action, `%${search}%`),
            ilike(adminAuditLog.entityType ?? '', `%${search}%`),
            sql`${adminAuditLog.details}::text ILIKE ${'%' + search + '%'}`
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(adminAuditLog)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get audit logs with admin info
      const logs = await db.query.adminAuditLog.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy:
          sortOrder === 'desc'
            ? [desc(adminAuditLog[sortBy])]
            : [adminAuditLog[sortBy]],
        with: {
          admin: {
            columns: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      return {
        logs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get audit log by ID
   */
  get: protectedProcedure
    .input(z.object({ logId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { logId } = input;

      const log = await db.query.adminAuditLog.findFirst({
        where: eq(adminAuditLog.id, logId),
        with: {
          admin: {
            columns: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      if (!log) {
        throw new Error('Audit log not found');
      }

      return log;
    }),

  /**
   * Get audit log statistics
   */
  getStats: protectedProcedure
    .input(
      z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { dateFrom, dateTo } = input;

      const conditions = [];

      if (dateFrom) {
        conditions.push(gte(adminAuditLog.createdAt, new Date(dateFrom)));
      }

      if (dateTo) {
        conditions.push(lte(adminAuditLog.createdAt, new Date(dateTo)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get action counts
      const actionCounts = await db
        .select({
          action: adminAuditLog.action,
          count: sql<number>`count(*)`,
        })
        .from(adminAuditLog)
        .where(whereClause)
        .groupBy(adminAuditLog.action);

      // Get entity type counts
      const entityTypeCounts = await db
        .select({
          entityType: adminAuditLog.entityType,
          count: sql<number>`count(*)`,
        })
        .from(adminAuditLog)
        .where(whereClause)
        .groupBy(adminAuditLog.entityType);

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(adminAuditLog)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get admin activity counts
      const adminActivity = await db
        .select({
          adminId: adminAuditLog.adminId,
          count: sql<number>`count(*)`,
        })
        .from(adminAuditLog)
        .where(whereClause)
        .groupBy(adminAuditLog.adminId)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Enrich with admin info
      const adminActivityWithInfo = await Promise.all(
        adminActivity.map(async (item) => {
          if (!item.adminId) return { ...item, admin: null };
          const admin = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.id, item.adminId),
            columns: { id: true, email: true, name: true },
          });
          return { ...item, admin };
        })
      );

      return {
        total,
        actionCounts: actionCounts.map((a) => ({
          action: a.action,
          count: Number(a.count),
        })),
        entityTypeCounts: entityTypeCounts
          .filter((e) => e.entityType)
          .map((e) => ({
            entityType: e.entityType,
            count: Number(e.count),
          })),
        topAdmins: adminActivityWithInfo.map((a) => ({
          adminId: a.adminId,
          admin: a.admin,
          count: Number(a.count),
        })),
      };
    }),
});
