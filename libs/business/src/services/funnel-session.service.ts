/**
 * Funnel Session Service
 *
 * Business logic for funnel session management.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import { FunnelSessionsRepository } from '@ryla/data/repositories/funnel-sessions.repository';
import type {
  CreateSessionData,
  UpdateSessionData,
  FunnelSession,
} from '@ryla/shared';

export class FunnelSessionService {
  private sessionsRepo: FunnelSessionsRepository;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.sessionsRepo = new FunnelSessionsRepository(db);
  }

  /**
   * Create a new funnel session
   * Returns existing session if sessionId already exists (idempotent)
   */
  async createSession(data: CreateSessionData): Promise<FunnelSession | null> {
    try {
      // Validate session ID
      if (!data.sessionId || data.sessionId.trim().length === 0) {
        throw new Error('Session ID is required');
      }

      // Validate current step if provided
      if (
        data.currentStep !== undefined &&
        (data.currentStep < 0 || !Number.isInteger(data.currentStep))
      ) {
        throw new Error('Current step must be a non-negative integer');
      }

      // Create session (repository handles idempotency)
      const session = await this.sessionsRepo.create({
        sessionId: data.sessionId,
        email: null,
        onWaitlist: false,
        currentStep: data.currentStep ?? null,
      });

      return session as FunnelSession;
    } catch (error) {
      console.error('Error creating funnel session:', error);
      return null; // Match Supabase behavior - return null on error
    }
  }

  /**
   * Update session with email, waitlist status, or current step
   */
  async updateSession(
    sessionId: string,
    data: UpdateSessionData
  ): Promise<FunnelSession | null> {
    try {
      // Validate session ID
      if (!sessionId || sessionId.trim().length === 0) {
        throw new Error('Session ID is required');
      }

      // Validate email if provided
      if (data.email !== undefined) {
        if (data.email !== null && data.email.trim().length === 0) {
          throw new Error('Email cannot be empty');
        }
        // Basic email validation
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          throw new Error('Invalid email format');
        }
      }

      // Validate current step if provided
      if (data.currentStep !== undefined && data.currentStep !== null) {
        if (data.currentStep < 0 || !Number.isInteger(data.currentStep)) {
          throw new Error('Current step must be a non-negative integer');
        }
      }

      // Build update data
      const updateData: Partial<{
        email: string | null;
        onWaitlist: boolean;
        currentStep: number | null;
      }> = {};

      if (data.email !== undefined) updateData.email = data.email;
      if (data.onWaitlist !== undefined)
        updateData.onWaitlist = data.onWaitlist;
      if (data.currentStep !== undefined)
        updateData.currentStep = data.currentStep;

      // Update session
      const session = await this.sessionsRepo.update(sessionId, updateData);

      if (!session) {
        return null; // Session not found
      }

      return session as FunnelSession;
    } catch (error) {
      console.error('Error updating funnel session:', error);
      return null; // Match Supabase behavior - return null on error
    }
  }

  /**
   * Get session by session ID
   */
  async getSession(sessionId: string): Promise<FunnelSession | null> {
    try {
      // Validate session ID
      if (!sessionId || sessionId.trim().length === 0) {
        return null;
      }

      const session = await this.sessionsRepo.findBySessionId(sessionId);

      return (session as FunnelSession | undefined) ?? null;
    } catch (error) {
      console.error('Error getting funnel session:', error);
      return null; // Match Supabase behavior - return null on error
    }
  }
}
