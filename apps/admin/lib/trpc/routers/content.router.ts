/**
 * Admin Content Router
 *
 * Provides content moderation operations for admin panel.
 * Part of EP-054: Content Moderation & Gallery
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  images,
  adminAuditLog,
} from '@ryla/data';
import { eq, and, or, ilike, desc, isNull, sql } from 'drizzle-orm';

/**
 * Image list query schema
 */
const listImagesSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  status: z.enum(['pending', 'generating', 'completed', 'failed']).optional(),
  userId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  nsfw: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Get image detail schema
 */
const getImageSchema = z.object({
  imageId: z.string().uuid(),
});

/**
 * Flag image schema
 */
const flagImageSchema = z.object({
  imageId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

/**
 * Delete image schema
 */
const deleteImageSchema = z.object({
  imageId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

export const contentRouter = router({
  /**
   * List all images with pagination, search, and filters
   */
  listImages: protectedProcedure
    .input(listImagesSchema)
    .query(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const {
        limit,
        offset,
        search,
        status,
        userId,
        characterId,
        nsfw,
        sortBy,
        sortOrder,
      } = input;

      // Build where conditions
      const conditions = [];

      // Only show non-deleted images
      conditions.push(isNull(images.deletedAt));

      // Status filter
      if (status) {
        conditions.push(eq(images.status, status));
      }

      // User filter
      if (userId) {
        conditions.push(eq(images.userId, userId));
      }

      // Character filter
      if (characterId) {
        conditions.push(eq(images.characterId, characterId));
      }

      // NSFW filter
      if (nsfw !== undefined) {
        conditions.push(eq(images.nsfw, nsfw));
      }

      // Search filter (prompt, user email, character name)
      if (search) {
        conditions.push(
          or(
            ilike(images.prompt ?? '', `%${search}%`),
            ilike(images.originalPrompt ?? '', `%${search}%`),
            ilike(images.enhancedPrompt ?? '', `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(images)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get images with related data
      const imageList = await db.query.images.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: sortOrder === 'desc' ? [desc(images[sortBy])] : [images[sortBy]],
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
          character: {
            columns: {
              id: true,
              name: true,
              handle: true,
            },
          },
        },
      });

      // Format response with user/character info
      const formattedImages = imageList.map((img) => ({
        id: img.id,
        s3Url: img.s3Url,
        thumbnailUrl: img.thumbnailUrl,
        prompt: img.prompt || img.originalPrompt || img.enhancedPrompt || '',
        status: img.status,
        nsfw: img.nsfw,
        userId: img.userId,
        userEmail: img.user?.email || 'Unknown',
        userName: img.user?.name || 'Unknown',
        characterId: img.characterId,
        characterName: img.character?.name || 'Unknown',
        characterHandle: img.character?.handle || 'Unknown',
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
      }));

      return {
        images: formattedImages,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get image detail by ID
   */
  getImage: protectedProcedure
    .input(getImageSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { imageId } = input;

      const image = await db.query.images.findFirst({
        where: and(eq(images.id, imageId), isNull(images.deletedAt)),
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
          character: {
            columns: {
              id: true,
              name: true,
              handle: true,
            },
          },
        },
      });

      if (!image) {
        throw new Error('Image not found');
      }

      return {
        id: image.id,
        s3Url: image.s3Url,
        thumbnailUrl: image.thumbnailUrl,
        prompt: image.prompt || image.originalPrompt || image.enhancedPrompt || '',
        negativePrompt: image.negativePrompt,
        status: image.status,
        nsfw: image.nsfw,
        userId: image.userId,
        userEmail: image.user?.email || 'Unknown',
        userName: image.user?.name || 'Unknown',
        characterId: image.characterId,
        characterName: image.character?.name || 'Unknown',
        characterHandle: image.character?.handle || 'Unknown',
        scene: image.scene,
        environment: image.environment,
        outfit: image.outfit,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
        width: image.width,
        height: image.height,
      };
    }),

  /**
   * Flag an image (mark as NSFW or inappropriate)
   */
  flagImage: protectedProcedure
    .input(flagImageSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { imageId, reason } = input;

      // Check if image exists
      const image = await db.query.images.findFirst({
        where: eq(images.id, imageId),
      });

      if (!image) {
        throw new Error('Image not found');
      }

      // Update image to flagged (set nsfw = true)
      await db
        .update(images)
        .set({
          nsfw: true,
          updatedAt: new Date(),
        })
        .where(eq(images.id, imageId));

      // Log audit
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'image',
        entityId: imageId,
        details: {
          oldValue: { nsfw: image.nsfw },
          newValue: { nsfw: true, reason },
        },
      });

      return { success: true };
    }),

  /**
   * Soft delete an image
   */
  deleteImage: protectedProcedure
    .input(deleteImageSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { imageId, reason } = input;

      // Check if image exists
      const image = await db.query.images.findFirst({
        where: eq(images.id, imageId),
      });

      if (!image) {
        throw new Error('Image not found');
      }

      // Soft delete
      await db
        .update(images)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(images.id, imageId));

      // Log audit
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'delete',
        entityType: 'image',
        entityId: imageId,
        details: {
          oldValue: { deletedAt: image.deletedAt },
          newValue: { deletedAt: new Date(), reason },
        },
      });

      return { success: true };
    }),
});
