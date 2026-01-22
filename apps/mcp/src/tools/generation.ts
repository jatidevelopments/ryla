/**
 * Image Generation Tools
 *
 * Tools for AI image generation:
 * - Generate base character images
 * - Generate studio shots
 * - Check job status
 * - Get generation results
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { apiCall } from '../api-client.js';

export function registerGenerationTools(server: FastMCP) {
  /**
   * Generate studio images
   */
  server.addTool({
    name: 'ryla_generate_studio',
    description: `Generate studio images for a character. This is the primary image generation tool for creating AI influencer content.
    
Use cases:
- Generate pose thumbnails for the UI
- Create template preview images
- Test different scene/outfit/lighting combinations
- Batch generate content for testing

Returns a jobId that can be polled with ryla_job_status.`,
    parameters: z.object({
      characterId: z.string().uuid().describe('The character UUID to generate images for'),
      scene: z.string().default('professional photoshoot').describe('Scene description'),
      environment: z.string().default('studio').describe('Environment setting'),
      outfit: z.string().default('casual').describe('Outfit description'),
      poseId: z.string().optional().describe('Specific pose ID (e.g., "standing-casual", "sitting-elegant")'),
      lighting: z.string().optional().describe('Lighting style (e.g., "golden hour", "studio flash")'),
      expression: z.string().optional().describe('Facial expression'),
      aspectRatio: z
        .enum(['1:1', '9:16', '2:3'])
        .default('9:16')
        .describe('Image aspect ratio'),
      // qualityMode removed - EP-045
      count: z.number().min(1).max(4).default(1).describe('Number of images to generate'),
      nsfw: z.boolean().default(false).describe('Enable NSFW content generation'),
      additionalDetails: z.string().optional().describe('Additional prompt details'),
      seed: z.number().optional().describe('Random seed for reproducibility'),
      modelProvider: z.enum(['comfyui', 'fal']).optional().describe('Model provider to use'),
      modelId: z.string().optional().describe('Specific model ID (for fal provider)'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          jobId: string;
          status: string;
          message: string;
        }>('/image/generate/studio', {
          method: 'POST',
          body: JSON.stringify({
            characterId: args.characterId,
            scene: args.scene,
            environment: args.environment,
            outfit: args.outfit,
            poseId: args.poseId,
            lighting: args.lighting,
            expression: args.expression,
            aspectRatio: args.aspectRatio,
            // qualityMode removed - EP-045
            count: args.count,
            nsfw: args.nsfw,
            additionalDetails: args.additionalDetails,
            seed: args.seed,
            modelProvider: args.modelProvider,
            modelId: args.modelId,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            jobId: result.jobId,
            status: result.status,
            message: result.message,
            nextStep: `Poll job status with ryla_job_status using jobId: ${result.jobId}`,
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Generate base character images
   */
  server.addTool({
    name: 'ryla_generate_base',
    description: `Generate base/reference images for a character. These are used as the foundation for PuLID face consistency.
    
Use this when:
- Creating a new character and need base images
- Testing different appearance configurations
- Generating character sheets`,
    parameters: z.object({
      appearance: z
        .object({
          gender: z.enum(['female', 'male']),
          style: z.enum(['realistic', 'anime']).default('realistic'),
          ethnicity: z.string().optional(),
          age: z.number().optional(),
          skinColor: z.string().optional(),
          eyeColor: z.string().optional(),
          hairStyle: z.string().optional(),
          hairColor: z.string().optional(),
          bodyType: z.string().optional(),
        })
        .describe('Character appearance configuration'),
      identity: z
        .object({
          name: z.string().optional(),
          archetype: z.string().optional(),
        })
        .optional()
        .describe('Character identity info'),
      nsfwEnabled: z.boolean().default(false),
      workflowId: z
        .enum(['z-image-danrisi', 'z-image-simple', 'z-image-pulid'])
        .optional()
        .describe('Specific ComfyUI workflow to use'),
      seed: z.number().optional().describe('Random seed for reproducibility'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          jobId: string;
          workflowUsed: string;
          status: string;
          message: string;
        }>('/image/generate/base', {
          method: 'POST',
          body: JSON.stringify({
            appearance: args.appearance,
            identity: args.identity,
            nsfwEnabled: args.nsfwEnabled,
            workflowId: args.workflowId,
            seed: args.seed,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            jobId: result.jobId,
            workflowUsed: result.workflowUsed,
            status: result.status,
            message: result.message,
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Check job status
   */
  server.addTool({
    name: 'ryla_job_status',
    description: `Check the status of a generation job. Returns current status, progress, and results if completed.
    
Status values:
- queued: Waiting to start
- processing: Currently generating
- completed: Done, results available
- failed: Error occurred
- cancelled: Job was cancelled`,
    parameters: z.object({
      jobId: z.string().uuid().describe('The job UUID to check'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          id: string;
          status: string;
          type: string;
          imageCount: number;
          completedCount: number;
          output: Record<string, unknown> | null;
          error: string | null;
          createdAt: string;
          startedAt: string | null;
          completedAt: string | null;
        }>(`/image/jobs/${args.jobId}`);

        return JSON.stringify(
          {
            success: true,
            job: {
              id: result.id,
              status: result.status,
              type: result.type,
              progress: `${result.completedCount}/${result.imageCount}`,
              output: result.output,
              error: result.error,
              timing: {
                created: result.createdAt,
                started: result.startedAt,
                completed: result.completedAt,
              },
            },
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Get ComfyUI job results
   */
  server.addTool({
    name: 'ryla_comfyui_results',
    description: `Get results from a ComfyUI generation job. Returns image URLs that have been uploaded to storage.
    
Use this after ryla_generate_base completes to get the actual image URLs.`,
    parameters: z.object({
      promptId: z.string().describe('The ComfyUI prompt ID (returned from generate_base)'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          status: string;
          images: Array<{
            url: string;
            filename: string;
          }>;
        }>(`/image/comfyui/${args.promptId}/results`);

        return JSON.stringify(
          {
            success: true,
            status: result.status,
            imageCount: result.images.length,
            images: result.images,
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Get available workflows
   */
  server.addTool({
    name: 'ryla_workflows_list',
    description: 'Get list of available ComfyUI workflows for image generation.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await apiCall<{
          available: string[];
          recommended: string;
          descriptions: Record<string, string>;
        }>('/image/workflows');

        return JSON.stringify(
          {
            success: true,
            ...result,
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Upscale an image
   */
  server.addTool({
    name: 'ryla_upscale_image',
    description: 'Upscale an existing image to higher resolution using AI upscaling models.',
    parameters: z.object({
      imageId: z.string().uuid().describe('The image UUID to upscale'),
      modelId: z
        .string()
        .optional()
        .describe('Upscaling model ID (default: fal-ai/clarity-upscaler)'),
      scale: z.number().min(1).max(4).optional().describe('Upscale factor (1-4x)'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          jobId: string;
          status: string;
        }>('/image/upscale', {
          method: 'POST',
          body: JSON.stringify({
            imageId: args.imageId,
            modelId: args.modelId,
            scale: args.scale,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            jobId: result.jobId,
            status: result.status,
            message: 'Upscale job started',
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });
}

