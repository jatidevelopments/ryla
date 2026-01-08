/**
 * Character Router
 *
 * Handles AI character (influencer) operations using Drizzle ORM.
 * NO SUPABASE - direct Postgres access.
 */

import { z } from 'zod';
import { eq, and, isNull, desc, sql, ne, or, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { characters, images, influencerRequests, users, NotificationsRepository, type CharacterConfig } from '@ryla/data';
import type { NotificationType } from '@ryla/data/schema';
import { sendEmail, InfluencerRequestNotificationEmail } from '@ryla/email';

import { router, protectedProcedure } from '../trpc';

function tryExtractS3KeyFromStoredUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // If it's already just a key (no protocol), return as-is
    if (!url.includes('://') && !url.startsWith('/')) {
      // Check if it looks like an S3 key (has path separators)
      if (url.includes('/')) {
        return url;
      }
      return null;
    }

    const u = new URL(url);
    
    // Handle MinIO path-style: http://localhost:9000/ryla-images/<key>
    const marker = '/ryla-images/';
    const idx = u.pathname.indexOf(marker);
    if (idx !== -1) {
      const key = u.pathname.slice(idx + marker.length);
      if (key) return decodeURIComponent(key);
    }
    
    // Handle virtual-hosted style: http://ryla-images.localhost:9000/<key>
    if (u.hostname.includes('ryla-images')) {
      const key = u.pathname.slice(1); // Remove leading /
      if (key) return decodeURIComponent(key);
    }
    
    // Handle AWS S3 URLs: https://bucket.s3.region.amazonaws.com/key
    // or https://s3.region.amazonaws.com/bucket/key
    if (u.hostname.includes('amazonaws.com') || u.hostname.includes('s3')) {
      // Remove query parameters (signature, etc.)
      const pathWithoutQuery = u.pathname;
      // Remove leading / and bucket name if present
      let key = pathWithoutQuery;
      if (key.startsWith('/')) key = key.slice(1);
      
      // If hostname contains bucket name, path is just the key
      // Otherwise, path might be /bucket/key
      const bucketMarker = '/ryla-images/';
      const bucketIdx = key.indexOf(bucketMarker);
      if (bucketIdx !== -1) {
        key = key.slice(bucketIdx + bucketMarker.length);
      }
      
      if (key) return decodeURIComponent(key);
    }
    
    // Handle generic S3-compatible URLs: extract path after bucket name
    // Try to find /ryla-images/ or use the path directly
    if (u.pathname.includes('/ryla-images/')) {
      const key = u.pathname.split('/ryla-images/')[1];
      if (key) return decodeURIComponent(key);
    }
    
    return null;
  } catch {
    return null;
  }
}

function createS3ClientForSigning() {
  const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_S3_SECRET_KEY;
  const endpoint = process.env.AWS_S3_ENDPOINT;
  const region = process.env.AWS_S3_REGION || 'us-east-1';
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'ryla-images';
  const urlTtl = Number(process.env.AWS_S3_URL_TTL) || 3600;

  if (!accessKeyId || !secretAccessKey) return null;

  const client = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
  });

  return { client, bucketName, urlTtl };
}

// Character configuration schema (matching CharacterConfig interface)
const characterConfigSchema = z.object({
  gender: z.enum(['female', 'male']).optional(),
  style: z.enum(['realistic', 'anime']).optional(),
  // Step 2: General (Basic Appearance)
  ethnicity: z.string().optional(),
  age: z.number().min(18).max(80).optional(),
  ageRange: z.string().optional(),
  skinColor: z.string().optional(),
  // Step 3: Face (Facial Features)
  eyeColor: z.string().optional(),
  faceShape: z.string().optional(),
  // Step 4: Hair
  hairStyle: z.string().optional(),
  hairColor: z.string().optional(),
  // Step 5: Body
  bodyType: z.string().optional(),
  assSize: z.string().optional(),
  breastSize: z.string().optional(),
  breastType: z.string().optional(),
  // Step 6: Skin Features
  freckles: z.string().optional(),
  scars: z.string().optional(),
  beautyMarks: z.string().optional(),
  // Step 7: Body Modifications
  piercings: z.string().optional(),
  tattoos: z.string().optional(),
  // Step 8: Identity
  defaultOutfit: z.string().optional(),
  archetype: z.string().optional(),
  personalityTraits: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
  handle: z.string().max(50).optional(),
  // Advanced (kept for backward compatibility)
  voice: z.string().optional(),
  videoContentOptions: z.array(z.string()).optional(),
  // Settings
  nsfwEnabled: z.boolean().optional(),
  profilePictureSetId: z.enum(['classic-influencer', 'professional-model', 'natural-beauty']).nullable().optional(),
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

      // Get image counts for all characters in one query
      const characterIds = items.map((char) => char.id);
      const imageCountsMap: Record<string, number> = {};
      
      // Initialize all characters with 0 count
      for (const char of items) {
        imageCountsMap[char.id] = 0;
      }
      
      if (characterIds.length > 0) {
        try {
          const imageCounts = await ctx.db
            .select({
              characterId: images.characterId,
              count: sql<number>`count(*)::int`,
            })
            .from(images)
            .where(
              and(
                inArray(images.characterId, characterIds),
                eq(images.userId, ctx.user.id),
                isNull(images.deletedAt),
                eq(images.status, 'completed')
              )
            )
            .groupBy(images.characterId);

          // Build map of characterId -> count
          for (const row of imageCounts) {
            if (row.characterId) {
              imageCountsMap[row.characterId] = Number(row.count);
            }
          }
        } catch (error) {
          // Log error but don't fail the entire query
          console.error('Failed to fetch image counts:', error);
        }
      }

      // Add image counts to items
      const itemsWithCounts = items.map((item) => ({
        ...item,
        imageCount: imageCountsMap[item.id] ?? 0,
      }));

      // Re-sign baseImageUrl (it is often stored as a presigned URL and expires)
      const s3 = createS3ClientForSigning();
      const itemsWithSignedBaseImage = await Promise.all(
        itemsWithCounts.map(async (item) => {
          const baseImageUrl = item.baseImageUrl;
          if (!baseImageUrl || !s3) return item;

          // Try to extract S3 key from stored URL
          let key = tryExtractS3KeyFromStoredUrl(baseImageUrl);
          
          // If extraction failed, check if stored value is already a key
          if (!key && !baseImageUrl.includes('://') && !baseImageUrl.startsWith('/')) {
            key = baseImageUrl;
          }
          
          if (!key) return item;

          try {
            const url = await getSignedUrl(
              s3.client,
              new GetObjectCommand({ Bucket: s3.bucketName, Key: key }),
              { expiresIn: s3.urlTtl },
            );
            return { ...item, baseImageUrl: url };
          } catch (error) {
            // Log error but return item with original URL
            console.error('Failed to generate signed URL for baseImageUrl in list:', {
              key,
              error: error instanceof Error ? error.message : String(error),
            });
            return item;
          }
        }),
      );

      // Get total count
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(characters)
        .where(and(...conditions));

      return {
        items: itemsWithSignedBaseImage,
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

      // Get image count for this character
      let imageCount = 0;
      try {
        const [countResult] = await ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(images)
          .where(
            and(
              eq(images.characterId, input.id),
              eq(images.userId, ctx.user.id),
              isNull(images.deletedAt),
              eq(images.status, 'completed')
            )
          );
        imageCount = Number(countResult?.count ?? 0);
      } catch (error) {
        console.error('Failed to fetch image count:', error);
      }

      const s3 = createS3ClientForSigning();
      let baseImageUrl = character.baseImageUrl;
      if (baseImageUrl && s3) {
        // Try to extract S3 key from stored URL
        const key = tryExtractS3KeyFromStoredUrl(baseImageUrl);
        if (key) {
          try {
            // Generate fresh signed URL
            baseImageUrl = await getSignedUrl(
              s3.client,
              new GetObjectCommand({ Bucket: s3.bucketName, Key: key }),
              { expiresIn: s3.urlTtl },
            );
          } catch (error) {
            // Log error but keep stored value as fallback
            console.error('Failed to generate signed URL for baseImageUrl:', {
              key,
              error: error instanceof Error ? error.message : String(error),
            });
            // If stored URL looks expired or invalid, try to use key directly
            // This handles cases where stored URL is expired but key is valid
          }
        } else {
          // If we can't extract a key, check if stored URL is already a valid URL
          // If it's not a valid URL format, it might be stored as just a key
          if (!baseImageUrl.includes('://') && !baseImageUrl.startsWith('/')) {
            // Might be stored as just the key - try to use it directly
            try {
              baseImageUrl = await getSignedUrl(
                s3.client,
                new GetObjectCommand({ Bucket: s3.bucketName, Key: baseImageUrl }),
                { expiresIn: s3.urlTtl },
              );
            } catch (error) {
              console.error('Failed to generate signed URL from key:', {
                key: baseImageUrl,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
        }
      }

      return { ...character, baseImageUrl, imageCount };
    }),

  /**
   * Create a new character
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        config: characterConfigSchema,
        baseImageUrl: z.string().url(),
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
          baseImageUrl: input.baseImageUrl,
          status: 'draft',
        })
        .returning();

      // Create notification
      const notificationsRepo = new NotificationsRepository(ctx.db);
      await notificationsRepo.create({
        userId: ctx.user.id,
        type: 'character.created' as NotificationType,
        title: 'Character created!',
        body: `${input.name} is ready. Start generating images!`,
        href: `/influencer/${character.id}`,
        metadata: { 
          characterId: character.id, 
          characterName: input.name,
          baseImageUrl: input.baseImageUrl,
        },
      });

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
      const { id, config, handle, ...rest } = input;

      // Verify ownership
      const existing = await ctx.db.query.characters.findFirst({
        where: and(
          eq(characters.id, id),
          eq(characters.userId, ctx.user.id),
          isNull(characters.deletedAt)
        ),
        columns: { id: true, config: true, handle: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Character not found',
        });
      }

      // Validate handle uniqueness if provided
      if (handle !== undefined && handle !== existing.handle) {
        const cleanHandle = handle.trim().toLowerCase();
        
        // Check if handle is already taken by another character of this user
        const existingWithHandle = await ctx.db.query.characters.findFirst({
          where: and(
            eq(characters.userId, ctx.user.id),
            eq(characters.handle, cleanHandle),
            ne(characters.id, id),
            isNull(characters.deletedAt)
          ),
          columns: { id: true },
        });

        if (existingWithHandle) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This handle is already taken. Please choose another.',
          });
        }
      }

      // Merge config if provided
      const updateData: Record<string, unknown> = {
        ...rest,
        updatedAt: new Date(),
      };

      if (handle !== undefined) {
        updateData['handle'] = handle.trim().toLowerCase();
      }

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

  /**
   * Submit an influencer request (for creating AI from existing person)
   */
  submitInfluencerRequest: protectedProcedure
    .input(
      z.object({
        consent: z.boolean(),
        instagram: z.preprocess(
          (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
          z.string().trim().optional()
        ),
        tiktok: z.preprocess(
          (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
          z.string().trim().optional()
        ),
        description: z.preprocess(
          (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
          z.string().trim().max(500).optional()
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.consent) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Consent is required to submit a request',
        });
      }

      const [request] = await ctx.db
        .insert(influencerRequests)
        .values({
          userId: ctx.user.id,
          consent: input.consent,
          instagram: input.instagram || null,
          tiktok: input.tiktok || null,
          description: input.description || null,
          status: 'pending',
        })
        .returning();

      // Get user info for email notification
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
        columns: {
          name: true,
          publicName: true,
          email: true,
        },
      });

      const userName = user?.name || user?.publicName || null;
      const userEmail = user?.email || ctx.user.email || 'unknown@example.com';

      // Send email notification to admin (don't fail request if email fails)
      const notificationEmail = process.env['INFLUENCER_REQUEST_NOTIFICATION_EMAIL'] || process.env['BUG_REPORT_NOTIFICATION_EMAIL'];
      if (notificationEmail) {
        try {
          // Build view URL (admin page or direct link)
          const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://app.ryla.ai';
          const viewUrl = `${appUrl}/admin/influencer-requests/${request.id}`;

          await sendEmail({
            to: notificationEmail,
            subject: `[Influencer Request] ${request.id.substring(0, 8)} - ${userName || userEmail}`,
            template: InfluencerRequestNotificationEmail,
            props: {
              requestId: request.id,
              userEmail,
              userName,
              instagram: input.instagram || null,
              tiktok: input.tiktok || null,
              description: input.description || null,
              viewUrl,
            },
          });
        } catch (error) {
          // Log but don't fail the request submission
          console.error('Failed to send influencer request notification email:', error);
        }
      } else {
        console.warn('INFLUENCER_REQUEST_NOTIFICATION_EMAIL not configured - skipping email notification');
      }

      return {
        success: true,
        requestId: request.id,
        message: 'Your request has been submitted. We will review it and contact you via email.',
      };
    }),
});
