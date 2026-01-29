/**
 * Funnel Router
 *
 * Handles funnel session and option operations.
 * Uses publicProcedure - no authentication required (anonymous sessions).
 */

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { FunnelSessionService } from '@ryla/business/services/funnel-session.service';
import { FunnelOptionService } from '@ryla/business/services/funnel-option.service';
import type { FunnelSession, FunnelOption } from '@ryla/shared';

export const funnelRouter = router({
  /**
   * Create a new funnel session
   * Returns existing session if sessionId already exists (idempotent)
   */
  createSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        currentStep: z.number().int().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<FunnelSession | null> => {
      const service = new FunnelSessionService(ctx.db);
      return await service.createSession({
        sessionId: input.sessionId,
        currentStep: input.currentStep,
      });
    }),

  /**
   * Update session with email, waitlist status, or current step
   */
  updateSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        email: z.string().email().nullable().optional(),
        onWaitlist: z.boolean().optional(),
        currentStep: z.number().int().min(0).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<FunnelSession | null> => {
      const service = new FunnelSessionService(ctx.db);
      const { sessionId, ...updateData } = input;
      return await service.updateSession(sessionId, updateData);
    }),

  /**
   * Get session by session ID
   */
  getSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }): Promise<FunnelSession | null> => {
      const service = new FunnelSessionService(ctx.db);
      return await service.getSession(input.sessionId);
    }),

  /**
   * Save a single option (upsert)
   */
  saveOption: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        optionKey: z.string().min(1),
        optionValue: z.any(), // JSONB can contain any JSON-serializable value
      })
    )
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const service = new FunnelOptionService(ctx.db);
      const success = await service.saveOption(
        input.sessionId,
        input.optionKey,
        input.optionValue
      );
      return { success };
    }),

  /**
   * Save multiple options (upsert)
   */
  saveAllOptions: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        options: z.record(z.string(), z.any()), // Record<optionKey, optionValue>
      })
    )
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const service = new FunnelOptionService(ctx.db);
      const success = await service.saveAllOptions(
        input.sessionId,
        input.options
      );
      return { success };
    }),

  /**
   * Get all options for a session
   */
  getSessionOptions: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }): Promise<FunnelOption[]> => {
      const service = new FunnelOptionService(ctx.db);
      return await service.getSessionOptions(input.sessionId);
    }),
});
