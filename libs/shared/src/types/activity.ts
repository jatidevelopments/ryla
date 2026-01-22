/**
 * Activity types and interfaces for the activity feed
 */

export type ActivityType =
  | 'generation_completed'
  | 'generation_failed'
  | 'generation_started'
  | 'credits_added'
  | 'credits_spent'
  | 'credits_refunded';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  occurredAt: string;
  sourceType: 'generation_job' | 'credit_transaction';
  sourceId: string;
  characterId?: string | null;
  imageId?: string | null; // First image ID for direct navigation
  imageCount?: number | null;
  thumbnailUrl?: string | null;
  status?: string | null;
  creditAmount?: number | null;
  balanceAfter?: number | null;
  description?: string | null;
}

export type FilterType = 'all' | 'generations' | 'credits';
export type TimeRangeType = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface ActivitySummary {
  generations: {
    completed: number;
    failed: number;
    processing: number;
    queued: number;
  };
  credits: {
    added: number;
    spent: number;
    refunded: number;
  };
  totalEvents: number;
}

