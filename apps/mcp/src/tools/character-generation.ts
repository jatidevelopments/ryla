/**
 * Character Generation Tools
 *
 * Advanced image generation tools for characters:
 * - Base image generation
 * - Character sheets
 * - Profile picture sets
 * - Regeneration
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { apiCall } from '../api-client.js';

export function registerCharacterGenerationTools(server: FastMCP) {
  /**
   * Generate base images
   */
  server.addTool({
    name: 'ryla_generate_base_images',
    description: `Generate 3 base image options from character config. Used in the character creation wizard.
    
Returns job IDs that can be polled for results. Credits are deducted per image.`,
    parameters: z.object({
      appearance: z.object({
        ethnicity: z.string().optional(),
        bodyType: z.string().optional(),
        hairColor: z.string().optional(),
        hairStyle: z.string().optional(),
        eyeColor: z.string().optional(),
        skinTone: z.string().optional(),
      }).describe('Character appearance config'),
      identity: z.object({
        gender: z.enum(['female', 'male', 'non-binary']).optional(),
        age: z.number().min(18).max(70).optional(),
        name: z.string().optional(),
      }).describe('Character identity config'),
      nsfwEnabled: z.boolean().default(false).describe('Enable NSFW generation'),
      workflowId: z.string().optional().describe('Override workflow (default: z-image-turbo)'),
      seed: z.number().optional().describe('Random seed for reproducibility'),
      steps: z.number().optional().describe('Generation steps (default: 4)'),
      cfg: z.number().optional().describe('CFG scale (default: 1)'),
      width: z.number().optional().describe('Image width (default: 1024)'),
      height: z.number().optional().describe('Image height (default: 1024)'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          jobId: string;
          allJobIds: string[];
          userId: string;
          status: string;
          message: string;
          creditsDeducted: number;
          creditBalance: number;
        }>('/characters/generate-base-images', {
          method: 'POST',
          body: JSON.stringify({
            appearance: args.appearance,
            identity: args.identity,
            nsfwEnabled: args.nsfwEnabled,
            workflowId: args.workflowId,
            seed: args.seed,
            steps: args.steps,
            cfg: args.cfg,
            width: args.width,
            height: args.height,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            ...result,
            note: 'Use ryla_get_base_image_results with allJobIds to check progress',
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
   * Get base image results
   */
  server.addTool({
    name: 'ryla_get_base_image_results',
    description: 'Get results for base image generation jobs.',
    parameters: z.object({
      jobId: z.string().describe('Primary job ID'),
      allJobIds: z.string().optional().describe('Comma-separated list of all job IDs for batch status'),
    }),
    execute: async (args) => {
      try {
        const params = args.allJobIds ? `?allJobIds=${args.allJobIds}` : '';
        const result = await apiCall<{
          status: string;
          images: Array<{
            id: string;
            url: string;
            thumbnailUrl: string;
          }>;
          error?: string;
        }>(`/characters/base-images/${args.jobId}${params}`);

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
   * Generate character sheet
   */
  server.addTool({
    name: 'ryla_generate_character_sheet',
    description: `Generate a character sheet (7-10 pose variations) from a base image.
    
Used after character creation to build the reference sheet. Uses PuLID for face consistency.`,
    parameters: z.object({
      baseImageUrl: z.string().url().describe('URL of the base image'),
      characterId: z.string().uuid().describe('Character UUID'),
      nsfwEnabled: z.boolean().default(false).describe('Include NSFW poses'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          jobId: string;
          userId: string;
          status: string;
          message: string;
          variations: number;
          creditsDeducted: number;
          creditBalance: number;
        }>('/characters/generate-character-sheet', {
          method: 'POST',
          body: JSON.stringify({
            baseImageUrl: args.baseImageUrl,
            characterId: args.characterId,
            nsfwEnabled: args.nsfwEnabled,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            ...result,
            note: 'Use ryla_get_character_sheet_results to check progress',
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
   * Get character sheet results
   */
  server.addTool({
    name: 'ryla_get_character_sheet_results',
    description: 'Get results for character sheet generation.',
    parameters: z.object({
      jobId: z.string().describe('Job ID from generate-character-sheet'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          status: string;
          images: Array<{
            id: string;
            url: string;
            thumbnailUrl: string;
          }>;
        }>(`/characters/character-sheet/${args.jobId}`);

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
   * Generate profile picture set
   */
  server.addTool({
    name: 'ryla_generate_profile_picture_set',
    description: `Generate a profile picture set (7-10 images) from a base image.
    
Uses preset sets like 'classic-influencer', 'lifestyle', etc. Supports fast (z-image) or consistent (PuLID) modes.`,
    parameters: z.object({
      baseImageUrl: z.string().url().describe('URL of the base image'),
      characterId: z.string().uuid().describe('Character UUID'),
      setId: z.string().default('classic-influencer').describe('Preset set ID'),
      nsfwEnabled: z.boolean().default(false).describe('Include NSFW content'),
      generationMode: z.enum(['fast', 'consistent']).default('fast').describe('fast=z-image, consistent=PuLID'),
      workflowId: z.string().optional().describe('Override workflow'),
      steps: z.number().optional(),
      cfg: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          jobId: string;
          allJobIds: string[];
          jobPositions: string[];
          userId: string;
          status: string;
          message: string;
          imageCount: number;
          creditsDeducted: number;
          creditBalance: number;
        }>('/characters/generate-profile-picture-set', {
          method: 'POST',
          body: JSON.stringify({
            baseImageUrl: args.baseImageUrl,
            characterId: args.characterId,
            setId: args.setId,
            nsfwEnabled: args.nsfwEnabled,
            generationMode: args.generationMode,
            workflowId: args.workflowId,
            steps: args.steps,
            cfg: args.cfg,
            width: args.width,
            height: args.height,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            ...result,
            note: 'Use ryla_get_profile_picture_results with allJobIds to check progress',
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
   * Get profile picture set results
   */
  server.addTool({
    name: 'ryla_get_profile_picture_results',
    description: 'Get results for profile picture set generation.',
    parameters: z.object({
      jobId: z.string().describe('Primary job ID'),
      allJobIds: z.string().optional().describe('Comma-separated list of all job IDs for batch status'),
    }),
    execute: async (args) => {
      try {
        const params = args.allJobIds ? `?allJobIds=${args.allJobIds}` : '';
        const result = await apiCall<{
          status: string;
          images: Array<{
            id: string;
            url: string;
            thumbnailUrl: string;
            s3Key?: string;
          }>;
          error?: string;
        }>(`/characters/profile-picture-set/${args.jobId}${params}`);

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
   * Regenerate single profile picture
   */
  server.addTool({
    name: 'ryla_regenerate_profile_picture',
    description: 'Regenerate a single profile picture with optional prompt override. Deducts 1 credit.',
    parameters: z.object({
      baseImageUrl: z.string().url().describe('Base image URL'),
      positionId: z.string().describe('Position ID to regenerate (e.g., "selfie-1")'),
      prompt: z.string().optional().describe('Custom prompt override'),
      setId: z.string().default('classic-influencer').describe('Preset set ID'),
      nsfwEnabled: z.boolean().default(false),
      generationMode: z.enum(['fast', 'consistent']).default('fast'),
      workflowId: z.string().optional(),
      steps: z.number().optional(),
      cfg: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          jobId: string;
          userId: string;
          status: string;
          message: string;
          creditsDeducted: number;
          creditBalance: number;
        }>('/characters/regenerate-profile-picture', {
          method: 'POST',
          body: JSON.stringify({
            baseImageUrl: args.baseImageUrl,
            positionId: args.positionId,
            prompt: args.prompt,
            setId: args.setId,
            nsfwEnabled: args.nsfwEnabled,
            generationMode: args.generationMode,
            workflowId: args.workflowId,
            steps: args.steps,
            cfg: args.cfg,
            width: args.width,
            height: args.height,
          }),
        });

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
}

