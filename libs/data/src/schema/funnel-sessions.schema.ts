import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { funnelOptions } from './funnel-options.schema';

export const funnelSessions = pgTable(
  'funnel_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: text('session_id').notNull().unique(), // Client-generated session identifier
    email: text('email'), // Payment email from step 34
    onWaitlist: boolean('on_waitlist').default(false), // Waitlist status from step 35
    currentStep: integer('current_step'), // Last step reached
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('funnel_sessions_session_id_idx').on(table.sessionId),
  })
);

export const funnelSessionsRelations = relations(
  funnelSessions,
  ({ many }) => ({
    options: many(funnelOptions),
  })
);

// Type exports
export type FunnelSession = typeof funnelSessions.$inferSelect;
export type NewFunnelSession = typeof funnelSessions.$inferInsert;
