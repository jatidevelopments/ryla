/**
 * Character Management Tools
 *
 * Tools for managing AI influencer characters:
 * - List all characters
 * - Get character details
 * - Create new characters
 * - Update character configuration
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { apiCall } from '../api-client.js';

// Character configuration schema
const characterConfigSchema = z.object({
  gender: z.enum(['female', 'male']).optional(),
  style: z.enum(['realistic', 'anime']).optional(),
  ethnicity: z.string().optional(),
  age: z.number().min(18).max(80).optional(),
  skinColor: z.string().optional(),
  eyeColor: z.string().optional(),
  faceShape: z.string().optional(),
  hairStyle: z.string().optional(),
  hairColor: z.string().optional(),
  bodyType: z.string().optional(),
  breastSize: z.string().optional(),
  assSize: z.string().optional(),
  defaultOutfit: z.string().optional(),
  archetype: z.string().optional(),
  bio: z.string().max(500).optional(),
  handle: z.string().max(50).optional(),
  nsfwEnabled: z.boolean().optional(),
});

export function registerCharacterTools(server: FastMCP) {
  /**
   * List all characters
   */
  server.addTool({
    name: 'ryla_character_list',
    description:
      'List all AI influencer characters for the authenticated user. Returns character IDs, names, handles, status, and image counts.',
    parameters: z.object({
      limit: z
        .number()
        .min(1)
        .max(50)
        .default(20)
        .describe('Maximum number of characters to return'),
      offset: z.number().min(0).default(0).describe('Offset for pagination'),
      status: z
        .enum(['draft', 'generating', 'ready', 'failed', 'training', 'hd_ready'])
        .optional()
        .describe('Filter by character status'),
    }),
    execute: async (args) => {
      try {
        const params = new URLSearchParams();
        if (args.limit) params.set('limit', String(args.limit));
        if (args.offset) params.set('offset', String(args.offset));
        if (args.status) params.set('status', args.status);

        const result = await apiCall<{
          items: Array<{
            id: string;
            name: string;
            handle: string | null;
            status: string;
            baseImageUrl: string | null;
            imageCount: number;
          }>;
          total: number;
        }>(`/character?${params.toString()}`);

        return JSON.stringify(
          {
            success: true,
            total: result.total,
            characters: result.items.map((c) => ({
              id: c.id,
              name: c.name,
              handle: c.handle,
              status: c.status,
              imageCount: c.imageCount,
              hasBaseImage: !!c.baseImageUrl,
            })),
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
   * Get character by ID
   */
  server.addTool({
    name: 'ryla_character_get',
    description:
      'Get detailed information about a specific character including full configuration, status, and image count.',
    parameters: z.object({
      characterId: z.string().uuid().describe('The character UUID'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          id: string;
          name: string;
          handle: string | null;
          config: Record<string, unknown>;
          status: string;
          baseImageUrl: string | null;
          imageCount: number;
          createdAt: string;
          updatedAt: string;
        }>(`/character/${args.characterId}`);

        return JSON.stringify(
          {
            success: true,
            character: {
              id: result.id,
              name: result.name,
              handle: result.handle,
              status: result.status,
              config: result.config,
              imageCount: result.imageCount,
              baseImageUrl: result.baseImageUrl,
              createdAt: result.createdAt,
              updatedAt: result.updatedAt,
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
   * Create a new character
   */
  server.addTool({
    name: 'ryla_character_create',
    description:
      'Create a new AI influencer character with specified appearance configuration. Requires a name, config object, and base image URL.',
    parameters: z.object({
      name: z.string().min(1).max(100).describe('Character display name'),
      config: characterConfigSchema.describe('Character appearance configuration'),
      baseImageUrl: z.string().url().describe('URL to the base/reference image'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          id: string;
          name: string;
          status: string;
        }>('/character', {
          method: 'POST',
          body: JSON.stringify({
            name: args.name,
            config: args.config,
            baseImageUrl: args.baseImageUrl,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            character: {
              id: result.id,
              name: result.name,
              status: result.status,
            },
            message: 'Character created successfully',
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
   * Update character configuration
   */
  server.addTool({
    name: 'ryla_character_update',
    description:
      'Update an existing character name, handle, or appearance configuration. Only provided fields will be updated.',
    parameters: z.object({
      characterId: z.string().uuid().describe('The character UUID to update'),
      name: z.string().min(1).max(100).optional().describe('New display name'),
      handle: z.string().max(50).optional().describe('New @handle (must be unique)'),
      config: characterConfigSchema.optional().describe('Updated appearance config (merged with existing)'),
    }),
    execute: async (args) => {
      try {
        const updateData: Record<string, unknown> = {};
        if (args.name) updateData.name = args.name;
        if (args.handle) updateData.handle = args.handle;
        if (args.config) updateData.config = args.config;

        const result = await apiCall<{
          id: string;
          name: string;
          handle: string | null;
          status: string;
        }>(`/character/${args.characterId}`, {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        });

        return JSON.stringify(
          {
            success: true,
            character: {
              id: result.id,
              name: result.name,
              handle: result.handle,
              status: result.status,
            },
            message: 'Character updated successfully',
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

