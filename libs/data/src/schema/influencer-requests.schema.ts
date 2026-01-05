/**
 * Influencer Requests Schema
 *
 * Stores user requests to create AI influencers based on existing persons.
 * Used for compliance and consent tracking.
 */

import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

/**
 * Influencer requests table
 */
export const influencerRequests = pgTable(
  'influencer_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    
    // Consent and compliance
    consent: boolean('consent').notNull(),
    
    // Social media links (optional)
    instagram: text('instagram'),
    tiktok: text('tiktok'),
    
    // Description (optional)
    description: text('description'),
    
    // Status tracking
    status: text('status').default('pending').notNull(), // pending, approved, rejected, in_review
    
    // Admin notes
    adminNotes: text('admin_notes'),
    
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    reviewedAt: timestamp('reviewed_at'),
  },
  (table) => ({
    userIdx: index('influencer_requests_user_idx').on(table.userId),
    statusIdx: index('influencer_requests_status_idx').on(table.status),
    createdAtIdx: index('influencer_requests_created_at_idx').on(table.createdAt),
  })
);

export type InfluencerRequest = typeof influencerRequests.$inferSelect;
export type NewInfluencerRequest = typeof influencerRequests.$inferInsert;

