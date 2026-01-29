import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { funnelSessions } from './funnel-sessions.schema';

export const funnelOptions = pgTable(
  'funnel_options',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => funnelSessions.sessionId, { onDelete: 'cascade' }),
    optionKey: text('option_key').notNull(), // Field name from FunnelSchema
    optionValue: jsonb('option_value').notNull(), // Value (supports strings, numbers, booleans, arrays)
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('funnel_options_session_id_idx').on(table.sessionId),
    optionKeyIdx: index('funnel_options_option_key_idx').on(table.optionKey),
    sessionOptionUnique: unique('funnel_options_session_option_unique').on(
      table.sessionId,
      table.optionKey
    ),
  })
);

export const funnelOptionsRelations = relations(funnelOptions, ({ one }) => ({
  session: one(funnelSessions, {
    fields: [funnelOptions.sessionId],
    references: [funnelSessions.sessionId],
  }),
}));

// Type exports
export type FunnelOption = typeof funnelOptions.$inferSelect;
export type NewFunnelOption = typeof funnelOptions.$inferInsert;
