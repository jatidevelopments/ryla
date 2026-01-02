/**
 * Bug Report Router
 *
 * Handles bug report submissions with screenshot and console logs.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { router, publicProcedure } from '../trpc';
// Import directly to avoid bundling server-only code in client bundles
import { BugReportService } from '@ryla/business/services/bug-report.service';
import type { ConsoleLogEntry, BrowserMetadata } from '@ryla/data/schema/bug-reports.schema';

// Simple S3 client creation for screenshot upload
// Note: This is a simplified approach for MVP
function createS3Client() {
  const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_S3_SECRET_KEY;
  const endpoint = process.env.AWS_S3_ENDPOINT;
  const region = process.env.AWS_S3_REGION || 'us-east-1';
  // Use the main bucket (ryla-images) - bug reports are stored in bug-reports/ prefix
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'ryla-images';

  if (!accessKeyId || !secretAccessKey) {
    console.error('S3 credentials not configured');
    return null;
  }

  return {
    client: new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true', // For MinIO
    }),
    bucketName,
  };
}

async function uploadScreenshot(base64DataUrl: string): Promise<string | null> {
  try {
    const s3 = createS3Client();
    if (!s3) {
      console.error('S3 not configured for screenshot upload');
      return null;
    }

    // Parse base64 data URL
    const base64Data = base64DataUrl.split(',')[1];
    if (!base64Data) {
      console.error('Invalid base64 data URL format');
      return null;
    }
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    // Store in bug-reports/ prefix within the main bucket
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const filename = `bug-reports/${timestamp}-${randomId}.png`;
    const key = filename;

    // Upload to S3
    await s3.client.send(
      new PutObjectCommand({
        Bucket: s3.bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
      })
    );

    // Get signed URL (or public URL if bucket is public)
    const command = new GetObjectCommand({
      Bucket: s3.bucketName,
      Key: key,
    });
    const url = await getSignedUrl(s3.client, command, { expiresIn: 31536000 }); // 1 year

    return url;
  } catch (error: any) {
    // Provide more helpful error messages
    if (error?.Code === 'NoSuchBucket') {
      console.error(
        `S3 bucket '${error.BucketName}' does not exist. Please create it or set AWS_S3_BUCKET_NAME to an existing bucket (e.g., 'ryla-images').`
      );
    } else {
      console.error('Failed to upload screenshot:', error);
    }
    return null;
  }
}

// Input validation schema
const submitBugReportSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  email: z.string().email().optional().or(z.literal('')),
  includeScreenshot: z.boolean().default(true),
  includeLogs: z.boolean().default(true),
  screenshot: z.string().optional(), // Base64 data URL
  consoleLogs: z
    .array(
      z.object({
        level: z.enum(['log', 'error', 'warn', 'info', 'debug']),
        timestamp: z.number(),
        message: z.string(),
        stack: z.string().optional(),
        args: z.array(z.unknown()).optional(),
      })
    )
    .optional(),
  browserMetadata: z.object({
    userAgent: z.string(),
    url: z.string(),
    viewport: z.object({
      width: z.number(),
      height: z.number(),
    }),
    platform: z.string(),
    language: z.string(),
    timezone: z.string(),
  }),
});

export const bugReportRouter = router({
  /**
   * Submit a bug report
   *
   * Public procedure (allows anonymous reports with email)
   * If user is authenticated, userId is automatically included.
   */
  submit: publicProcedure
    .input(submitBugReportSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id || null;

      // Validate screenshot if included
      if (input.includeScreenshot && input.screenshot) {
        const size = input.screenshot.length;
        // Limit to 5MB (base64 is ~33% larger than binary)
        if (size > 5 * 1024 * 1024) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Screenshot too large (max 5MB)',
          });
        }
      }

      // Validate console logs if included
      if (input.includeLogs && input.consoleLogs) {
        const logsSize = JSON.stringify(input.consoleLogs).length;
        // Limit to 1MB
        if (logsSize > 1024 * 1024) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Console logs too large (max 1MB)',
          });
        }
      }

      // Upload screenshot if provided
      let screenshotUrl: string | null = null;
      if (input.includeScreenshot && input.screenshot) {
        try {
          screenshotUrl = await uploadScreenshot(input.screenshot);
        } catch (error) {
          console.error('Screenshot upload failed:', error);
          // Continue without screenshot
        }
      }

      // Create bug report via service (email notification is handled in the service)
      try {
        const bugReportService = new BugReportService(ctx.db);
        const bugReport = await bugReportService.create({
          userId,
          email: input.email || undefined,
          description: input.description,
          screenshotUrl,
          consoleLogs: input.includeLogs ? (input.consoleLogs as ConsoleLogEntry[]) : null,
          browserMetadata: input.browserMetadata as BrowserMetadata,
        });

        return {
          success: true,
          bugReportId: bugReport.id,
          message: 'Bug report submitted successfully',
        };
      } catch (error) {
        console.error('Failed to create bug report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to submit bug report',
          cause: error,
        });
      }
    }),
});

