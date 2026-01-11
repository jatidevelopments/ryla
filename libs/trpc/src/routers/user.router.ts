/**
 * User Router
 *
 * Handles user-related operations using Drizzle ORM.
 * NO SUPABASE - direct Postgres access.
 */

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { users, images, ImagesRepository } from '@ryla/data';

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
      generation: {
        defaultQuality: settings.generation?.defaultQuality ?? false,
      },
      content: {
        nsfwDefault: settings.content?.nsfwDefault ?? false,
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
        generation: z
          .object({
            defaultQuality: z.boolean().optional(),
          })
          .optional(),
        content: z
          .object({
            nsfwDefault: z.boolean().optional(),
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
        generation: {
          ...currentSettings.generation,
          ...input.generation,
        },
        content: {
          ...currentSettings.content,
          ...input.content,
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

  /**
   * Check if onboarding is completed
   */
  isOnboardingCompleted: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      columns: { settings: true },
    });

    const settings = user?.settings ? JSON.parse(user.settings) : {};
    return {
      completed: settings.onboarding?.completed === true,
      completedAt: settings.onboarding?.completedAt || null,
    };
  }),

  /**
   * Complete onboarding - save answers and mark as completed
   */
  completeOnboarding: protectedProcedure
    .input(
      z.object({
        referralSource: z.enum([
          'tiktok',
          'reddit',
          'instagram',
          'google',
          'friend',
          'other',
        ]),
        aiInfluencerExperience: z.enum(['never', 'few', 'many']),
        referralSourceOther: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
        columns: { settings: true },
      });

      const currentSettings = user?.settings ? JSON.parse(user.settings) : {};

      const newSettings = {
        ...currentSettings,
        onboarding: {
          completed: true,
          completedAt: new Date().toISOString(),
          referralSource: input.referralSource,
          aiInfluencerExperience: input.aiInfluencerExperience,
          ...(input.referralSourceOther && { referralSourceOther: input.referralSourceOther }),
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
        onboarding: newSettings.onboarding,
      };
    }),

  /**
   * Check if user has accepted upload consent
   */
  hasUploadConsent: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      columns: { settings: true },
    });

    const settings = user?.settings ? JSON.parse(user.settings) : {};
    return {
      hasConsent: settings.uploadConsent?.accepted === true,
      acceptedAt: settings.uploadConsent?.acceptedAt || null,
    };
  }),

  /**
   * Accept upload consent (one-time acceptance)
   */
  acceptUploadConsent: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      columns: { settings: true },
    });

    const currentSettings = user?.settings ? JSON.parse(user.settings) : {};

    // Only update if not already accepted
    if (currentSettings.uploadConsent?.accepted !== true) {
      const newSettings = {
        ...currentSettings,
        uploadConsent: {
          accepted: true,
          acceptedAt: new Date().toISOString(),
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
        acceptedAt: newSettings.uploadConsent.acceptedAt,
      };
    }

    return {
      success: true,
      acceptedAt: currentSettings.uploadConsent?.acceptedAt || null,
      alreadyAccepted: true,
    };
  }),

  /**
   * Upload user image for object selection
   * Accepts base64 image data
   */
  uploadObjectImage: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(), // data:image/png;base64,... format
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check consent first
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
        columns: { settings: true },
      });

      const settings = user?.settings ? JSON.parse(user.settings) : {};
      if (settings.uploadConsent?.accepted !== true) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Upload consent not accepted. Please accept the consent first.',
        });
      }

      // Parse base64 data URL
      const base64Match = input.imageBase64.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!base64Match) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid base64 image format',
        });
      }

      const [, imageType, base64Data] = base64Match;
      const buffer = Buffer.from(base64Data, 'base64');

      // Create S3 client (same pattern as bug-report router)
      const accessKeyId = process.env['AWS_S3_ACCESS_KEY'];
      const secretAccessKey = process.env['AWS_S3_SECRET_KEY'];
      const endpoint = process.env['AWS_S3_ENDPOINT'];
      const region = process.env['AWS_S3_REGION'] || 'us-east-1';
      const bucketName = process.env['AWS_S3_BUCKET_NAME'] || 'ryla-images';

      if (!accessKeyId || !secretAccessKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'S3 storage not configured',
        });
      }

      const s3Client = new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: process.env['AWS_S3_FORCE_PATH_STYLE'] === 'true', // For MinIO
      });

      // Build storage path: users/{userId}/user-uploads/{filename}
      const imageId = randomUUID();
      const timestamp = Date.now();
      const shortId = imageId.slice(0, 8);
      const extension = imageType === 'jpeg' ? '.jpg' : `.${imageType}`;
      const filename = `user-upload_${timestamp}_${shortId}${extension}`;
      const key = `users/${ctx.user.id}/user-uploads/${filename}`;

      // Determine content type
      const contentType = imageType === 'jpeg' ? 'image/jpeg' : `image/${imageType}`;

      try {
        // Upload to S3/MinIO
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
          })
        );

        // Get signed URL (valid for 1 year)
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 31536000 });

        // Store image metadata in database
        const imagesRepo = new ImagesRepository(ctx.db);
        const imageRow = await imagesRepo.createImage({
          userId: ctx.user.id,
          characterId: null, // User uploads are not tied to a character
          s3Key: key,
          s3Url: url,
          thumbnailKey: key, // Use same key for thumbnail (can add resizing later)
          thumbnailUrl: url,
          prompt: input.name || 'User Uploaded Image',
          negativePrompt: null,
          seed: null,
          width: null, // Could extract from image if needed
          height: null,
          status: 'completed',
          scene: null, // User uploads don't have scene/environment/outfit
          environment: null,
          outfit: null,
          aspectRatio: null,
          qualityMode: null,
          nsfw: false,
          sourceImageId: null,
          editType: null,
          editMaskS3Key: null,
        });

        return {
          id: imageRow.id,
          imageUrl: url,
          thumbnailUrl: url,
          name: input.name || 'Uploaded Image',
          createdAt: imageRow.createdAt?.toISOString() || new Date().toISOString(),
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to upload image: ${error.message}`,
        });
      }
    }),
});
