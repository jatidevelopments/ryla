/**
 * Admin Bug Reports Router
 *
 * Provides bug report management operations for admin panel.
 * Part of EP-053: Bug Reports Management
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  bugReports,
  users,
  adminUsers,
  adminAuditLog,
} from '@ryla/data';
import { eq, and, or, ilike, desc, sql, gte, lte } from 'drizzle-orm';

/**
 * List bug reports schema
 */
const listBugReportsSchema = z.object({
  limit: z.number().min(1).max(100).default(25),
  offset: z.number().min(0).default(0),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
  search: z.string().optional(), // Search in description or email
});

/**
 * Update status schema
 */
const updateStatusSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  note: z.string().max(500).optional(),
});

/**
 * Add note schema
 */
const addNoteSchema = z.object({
  reportId: z.string().uuid(),
  note: z.string().min(1).max(1000),
});

export const bugReportsRouter = router({
  /**
   * List bug reports with filters and pagination
   */
  list: protectedProcedure
    .input(listBugReportsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, offset, status, userId, dateFrom, dateTo, search } = input;

      // Build where conditions
      const conditions = [];

      if (status) {
        conditions.push(eq(bugReports.status, status));
      }

      if (userId) {
        conditions.push(eq(bugReports.userId, userId));
      }

      if (dateFrom) {
        conditions.push(gte(bugReports.createdAt, new Date(dateFrom)));
      }

      if (dateTo) {
        conditions.push(lte(bugReports.createdAt, new Date(dateTo)));
      }

      if (search) {
        conditions.push(
          or(
            ilike(bugReports.description, `%${search}%`),
            ilike(bugReports.email, `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get bug reports
      const reports = await db.query.bugReports.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(bugReports.createdAt)],
        columns: {
          id: true,
          userId: true,
          email: true,
          description: true,
          screenshotUrl: true,
          consoleLogs: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(bugReports)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Enrich with user email if userId exists
      const enrichedReports = await Promise.all(
        reports.map(async (report) => {
          let userEmail = report.email;
          if (report.userId && !userEmail) {
            const user = await db.query.users.findFirst({
              where: eq(users.id, report.userId),
              columns: { email: true },
            });
            userEmail = user?.email || null;
          }

          return {
            ...report,
            userEmail,
            hasScreenshot: !!report.screenshotUrl,
            hasConsoleLogs: !!report.consoleLogs && Array.isArray(report.consoleLogs) && report.consoleLogs.length > 0,
          };
        })
      );

      return {
        reports: enrichedReports,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get single bug report by ID
   */
  get: protectedProcedure
    .input(z.object({ reportId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { reportId } = input;

      const report = await db.query.bugReports.findFirst({
        where: eq(bugReports.id, reportId),
      });

      if (!report) {
        throw new Error('Bug report not found');
      }

      // Get user info if userId exists
      let user = null;
      if (report.userId) {
        user = await db.query.users.findFirst({
          where: eq(users.id, report.userId),
          columns: {
            id: true,
            email: true,
            name: true,
            publicName: true,
          },
        });
      }

      return {
        ...report,
        user,
        hasScreenshot: !!report.screenshotUrl,
        hasConsoleLogs: !!report.consoleLogs && Array.isArray(report.consoleLogs) && report.consoleLogs.length > 0,
      };
    }),

  /**
   * Update bug report status
   */
  updateStatus: protectedProcedure
    .input(updateStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin, headers } = ctx;
      const { reportId, status, note } = input;

      // Get current report
      const report = await db.query.bugReports.findFirst({
        where: eq(bugReports.id, reportId),
      });

      if (!report) {
        throw new Error('Bug report not found');
      }

      const oldStatus = report.status;

      // Update status
      await db
        .update(bugReports)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(bugReports.id, reportId));

      // Log audit event
      const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
      const userAgent = headers.get('user-agent') || 'unknown';

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'bug_report_status_changed',
        entityType: 'bug_report',
        entityId: reportId,
        details: {
          oldStatus,
          newStatus: status,
          note: note || null,
        },
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),

  /**
   * Add note to bug report
   * Note: This uses the audit log for now. A dedicated admin_notes table could be added later.
   */
  addNote: protectedProcedure
    .input(addNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin, headers } = ctx;
      const { reportId, note } = input;

      // Verify report exists
      const report = await db.query.bugReports.findFirst({
        where: eq(bugReports.id, reportId),
      });

      if (!report) {
        throw new Error('Bug report not found');
      }

      // Log as audit event (acts as note)
      const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
      const userAgent = headers.get('user-agent') || 'unknown';

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'bug_report_note_added',
        entityType: 'bug_report',
        entityId: reportId,
        details: {
          note,
        },
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),

  /**
   * Get bug report statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    // Get counts by status
    const statusCounts = await db
      .select({
        status: bugReports.status,
        count: sql<number>`count(*)`,
      })
      .from(bugReports)
      .groupBy(bugReports.status);

    // Get open count
    const openCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bugReports)
      .where(eq(bugReports.status, 'open'));
    const openCount = Number(openCountResult[0]?.count ?? 0);

    // Get reports this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bugReports)
      .where(gte(bugReports.createdAt, weekAgo));
    const thisWeek = Number(thisWeekResult[0]?.count ?? 0);

    // Get reports last week
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const lastWeekResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bugReports)
      .where(
        and(
          gte(bugReports.createdAt, twoWeeksAgo),
          lte(bugReports.createdAt, weekAgo)
        )
      );
    const lastWeek = Number(lastWeekResult[0]?.count ?? 0);

    return {
      openCount,
      statusCounts: statusCounts.map((s) => ({
        status: s.status,
        count: Number(s.count),
      })),
      thisWeek,
      lastWeek,
      change: thisWeek - lastWeek,
    };
  }),

  /**
   * Get notes for a bug report (from audit log)
   */
  getNotes: protectedProcedure
    .input(z.object({ reportId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { reportId } = input;

      // Get all notes from audit log
      const notes = await db.query.adminAuditLog.findMany({
        where: and(
          eq(adminAuditLog.entityType, 'bug_report'),
          eq(adminAuditLog.entityId, reportId),
          eq(adminAuditLog.action, 'bug_report_note_added')
        ),
        orderBy: [desc(adminAuditLog.createdAt)],
        columns: {
          id: true,
          adminId: true,
          details: true,
          createdAt: true,
        },
      });

      // Enrich with admin names
      const enrichedNotes = await Promise.all(
        notes.map(async (note) => {
          const admin = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.id, note.adminId),
            columns: {
              name: true,
              email: true,
            },
          });

          return {
            id: note.id,
            note: (note.details as any)?.note || '',
            adminName: admin?.name || 'Unknown',
            adminEmail: admin?.email || '',
            createdAt: note.createdAt,
          };
        })
      );

      return enrichedNotes;
    }),
});
