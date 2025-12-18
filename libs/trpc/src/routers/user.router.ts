/**
 * User Router
 *
 * Handles user-related operations using Drizzle ORM.
 * NO SUPABASE - direct Postgres access.
 */

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

import { users } from '@ryla/data';

import { router, publicProcedure, protectedProcedure } from '../trpc';

export const userRouter = router({
  /**
   * Get current authenticated user
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    // User is guaranteed by protectedProcedure
    const dbUser = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      columns: {
        id: true,
        email: true,
        name: true,
        publicName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return dbUser;
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        publicName: z.string().min(3).max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if publicName is already taken (if updating)
      if (input.publicName) {
        const existing = await ctx.db.query.users.findFirst({
          where: eq(users.publicName, input.publicName),
          columns: { id: true },
        });

        if (existing && existing.id !== ctx.user.id) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This public name is already taken',
          });
        }
      }

      const [updated] = await ctx.db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          publicName: users.publicName,
        });

      return {
        success: true,
        user: updated,
      };
    }),

  /**
   * Get user by public name (public endpoint for profile pages)
   */
  getByPublicName: publicProcedure
    .input(z.object({ publicName: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.publicName, input.publicName),
        columns: {
          id: true,
          name: true,
          publicName: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    }),

  /**
   * Get user settings (stored as JSON in settings column)
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      columns: {
        settings: true,
      },
    });

    // Parse settings JSON or return defaults
    const settings = user?.settings ? JSON.parse(user.settings) : {};

    return {
      userId: ctx.user.id,
      notifications: {
        email: settings.notifications?.email ?? true,
        push: settings.notifications?.push ?? false,
      },
      privacy: {
        profilePublic: settings.privacy?.profilePublic ?? true,
      },
    };
  }),

  /**
   * Update user settings
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        notifications: z
          .object({
            email: z.boolean().optional(),
            push: z.boolean().optional(),
          })
          .optional(),
        privacy: z
          .object({
            profilePublic: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current settings
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
        columns: { settings: true },
      });

      const currentSettings = user?.settings ? JSON.parse(user.settings) : {};

      // Merge with new settings
      const newSettings = {
        ...currentSettings,
        notifications: {
          ...currentSettings.notifications,
          ...input.notifications,
        },
        privacy: {
          ...currentSettings.privacy,
          ...input.privacy,
        },
      };

      await ctx.db
        .update(users)
        .set({
          settings: JSON.stringify(newSettings),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        settings: newSettings,
      };
    }),
});
