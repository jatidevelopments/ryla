/**
 * Admin Router Setup
 *
 * This file combines all admin routers to avoid circular dependency issues.
 * The router helper is imported from base.ts, and all routers are imported here.
 */

import { router, publicProcedure } from './base';
import { statsRouter } from './routers/stats.router';
import { usersRouter } from './routers/users.router';
import { billingRouter } from './routers/billing.router';
import { bugReportsRouter } from './routers/bug-reports.router';
import { contentRouter } from './routers/content.router';
import { jobsRouter } from './routers/jobs.router';
import { analyticsRouter } from './routers/analytics.router';
import { systemRouter } from './routers/system.router';
import { libraryRouter } from './routers/library.router';
import { auditRouter } from './routers/audit.router';
import { loraRouter } from './routers/lora.router';
import { adminsRouter } from './routers/admins.router';
import { flagsRouter } from './routers/flags.router';
import { configRouter } from './routers/config.router';
import { notificationsRouter } from './routers/notifications.router';

/**
 * Admin router - combines all admin routers
 */
export const adminAppRouter = router({
  // Test procedure to verify connection
  test: publicProcedure.query(() => {
    return { message: 'Admin tRPC is working!' };
  }),

  // Stats router
  stats: statsRouter,

  // Users router
  users: usersRouter,

  // Billing router
  billing: billingRouter,

  // Bug reports router
  bugReports: bugReportsRouter,

  // Content router
  content: contentRouter,

  // Jobs router
  jobs: jobsRouter,

  // Analytics router
  analytics: analyticsRouter,

  // System router
  system: systemRouter,

  // Library router
  library: libraryRouter,

  // Audit router
  audit: auditRouter,

  // LoRA router
  lora: loraRouter,

  // Admins router
  admins: adminsRouter,

  // Feature flags router
  flags: flagsRouter,

  // System config router
  config: configRouter,

  // Broadcast notifications router
  notifications: notificationsRouter,
});
