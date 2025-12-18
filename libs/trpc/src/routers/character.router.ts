/**
 * Character Router
 *
 * Handles AI character (influencer) operations using Drizzle ORM.
 * NO SUPABASE - direct Postgres access.
 */

import { z } from 'zod';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

import { characters, type CharacterConfig } from '@ryla/data';

import { router, protectedProcedure } from '../trpc';

// Character configuration schema (matching CharacterConfig interface)
const characterConfigSchema = z.object({
  gender: z.enum(['female', 'male']).optional(),
  style: z.enum(['realistic', 'anime']).optional(),
  ethnicity: z.string().optional(),
  age: z.number().min(18).max(80).optional(),
  hairStyle: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  bodyType: z.string().optional(),
  breastSize: z.string().optional(),
  defaultOutfit: z.string().optional(),
  archetype: z.string().optional(),
  personalityTraits: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
  handle: z.string().max(50).optional(),
  nsfwEnabled: z.boolean().optional(),
});

export const characterRouter = router({
  /**
   * List all characters for the current user
   */
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
          status: z
            .enum([
              'draft',
              'generating',
              'ready',
              'failed',
              'training',
              'hd_ready',
            ])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0, status } = input ?? {};

      // Build where conditions
      const conditions = [
        eq(characters.userId, ctx.user.id),
        isNull(characters.deletedAt),
      ];

      if (status) {
        conditions.push(eq(characters.status, status));
      }

      const items = await ctx.db.query.characters.findMany({
        where: and(...conditions),
        limit,
        offset,
        orderBy: desc(characters.createdAt),
        columns: {
          id: true,
          name: true,
          handle: true,
          config: true,
          status: true,
          baseImageUrl: true,
          postCount: true,
          likedCount: true,
          createdAt: true,
        },
      });

      // Get total count
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(characters)
        .where(and(...conditions));

      return {
        items,
        total: Number(countResult?.count ?? 0),
        limit,
        offset,
      };
    }),

  /**
   * Get a single character by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const character = await ctx.db.query.characters.findFirst({
        where: and(
          eq(characters.id, input.id),
          eq(characters.userId, ctx.user.id),
          isNull(characters.deletedAt)
        ),
      });

      if (!character) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Character not found',
        });
      }

      return character;
    }),

  /**
   * Create a new character
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        config: characterConfigSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [character] = await ctx.db
        .insert(characters)
        .values({
          userId: ctx.user.id,
          name: input.name,
          handle: input.config.handle,
          config: input.config as CharacterConfig,
          status: 'draft',
        })
        .returning();

      return character;
    }),

  /**
   * Update character configuration
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        config: characterConfigSchema.optional(),
        handle: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, config, ...rest } = input;

      // Verify ownership
      const existing = await ctx.db.query.characters.findFirst({
        where: and(
          eq(characters.id, id),
          eq(characters.userId, ctx.user.id),
          isNull(characters.deletedAt)
        ),
        columns: { id: true, config: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Character not found',
        });
      }

      // Merge config if provided
      const updateData: Record<string, unknown> = {
        ...rest,
        updatedAt: new Date(),
      };

      if (config) {
        updateData['config'] = {
          ...(existing['config'] as CharacterConfig),
          ...config,
        };
      }

      const [updated] = await ctx.db
        .update(characters)
        .set(updateData)
        .where(eq(characters.id, id))
        .returning();

      return updated;
    }),

  /**
   * Soft delete a character
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.characters.findFirst({
        where: and(
          eq(characters.id, input.id),
          eq(characters.userId, ctx.user.id),
          isNull(characters.deletedAt)
        ),
        columns: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Character not found',
        });
      }

      await ctx.db
        .update(characters)
        .set({ deletedAt: new Date() })
        .where(eq(characters.id, input.id));

      return {
        success: true,
        id: input.id,
      };
    }),

  /**
   * Set the base image for a character
   */
  setBaseImage: protectedProcedure
    .input(
      z.object({
        characterId: z.string().uuid(),
        imageId: z.string().uuid(),
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.characters.findFirst({
        where: and(
          eq(characters.id, input.characterId),
          eq(characters.userId, ctx.user.id)
        ),
        columns: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Character not found',
        });
      }

      await ctx.db
        .update(characters)
        .set({
          baseImageId: input.imageId,
          baseImageUrl: input.imageUrl,
          status: 'ready',
          updatedAt: new Date(),
        })
        .where(eq(characters.id, input.characterId));

      return {
        success: true,
        characterId: input.characterId,
      };
    }),
});
