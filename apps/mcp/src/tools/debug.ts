/**
 * Debug Tools
 *
 * Advanced debugging tools for development:
 * - Database health checks
 * - Redis inspection
 * - System diagnostics
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { apiCall } from '../api-client.js';

export function registerDebugTools(server: FastMCP) {
  /**
   * Database health check
   */
  server.addTool({
    name: 'ryla_debug_database',
    description: 'Check database connectivity and health status.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await apiCall<{
          status: string;
          connected: boolean;
          latency?: number;
          version?: string;
        }>('/database-check');

        return JSON.stringify(
          {
            success: true,
            database: result,
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          note: 'Database may be unreachable',
        });
      }
    },
  });

  /**
   * Redis keys inspection
   */
  server.addTool({
    name: 'ryla_debug_redis',
    description: 'Get Redis keys for debugging cache/session state. Useful for debugging rate limiting, sessions, etc.',
    parameters: z.object({
      maxItems: z.number().min(1).max(500).default(50).describe('Max keys to return'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<Record<string, unknown>>(
          `/redis-keys/${args.maxItems}`
        );

        return JSON.stringify(
          {
            success: true,
            keyCount: Object.keys(result).length,
            keys: result,
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
   * User profile management
   */
  server.addTool({
    name: 'ryla_user_update_profile',
    description: 'Update user profile (name, public name).',
    parameters: z.object({
      name: z.string().optional().describe('Display name'),
      publicName: z.string().optional().describe('Public display name'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          user: {
            id: string;
            email: string;
            name: string | null;
          };
        }>('/user/profile', {
          method: 'PUT',
          body: JSON.stringify({
            name: args.name,
            publicName: args.publicName,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            user: result.user,
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
   * User settings management
   */
  server.addTool({
    name: 'ryla_user_update_settings',
    description: 'Update user settings (JSON string).',
    parameters: z.object({
      settings: z.string().describe('Settings as JSON string'),
    }),
    execute: async (args) => {
      try {
        await apiCall('/user/settings', {
          method: 'PUT',
          body: JSON.stringify({
            settings: args.settings,
          }),
        });

        return JSON.stringify({
          success: true,
          message: 'Settings updated',
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Character-specific image gallery
   */
  server.addTool({
    name: 'ryla_gallery_character_images',
    description: 'Get all images for a specific character. More specific than general gallery list.',
    parameters: z.object({
      characterId: z.string().uuid().describe('Character UUID'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          images: Array<{
            id: string;
            url: string;
            thumbnailUrl: string | null;
            liked: boolean;
            createdAt: string;
          }>;
        }>(`/image-gallery/characters/${args.characterId}/images`);

        return JSON.stringify(
          {
            success: true,
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
   * Outfit presets
   */
  server.addTool({
    name: 'ryla_outfit_presets_list',
    description: 'List outfit presets for a character/influencer.',
    parameters: z.object({
      influencerId: z.string().uuid().describe('Influencer/character UUID'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<
          Array<{
            id: string;
            name: string;
            description: string | null;
            config: Record<string, unknown>;
          }>
        >(`/outfit-presets/influencer/${args.influencerId}`);

        return JSON.stringify(
          {
            success: true,
            presets: result,
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
   * Create outfit preset
   */
  server.addTool({
    name: 'ryla_outfit_preset_create',
    description: 'Create a new outfit preset for a character.',
    parameters: z.object({
      influencerId: z.string().uuid().describe('Influencer/character UUID'),
      name: z.string().describe('Preset name'),
      description: z.string().optional().describe('Preset description'),
      outfitTop: z.string().optional(),
      outfitBottom: z.string().optional(),
      outfitShoes: z.string().optional(),
      outfitAccessories: z.string().optional(),
      outfitStyle: z.string().optional(),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          id: string;
          name: string;
        }>('/outfit-presets', {
          method: 'POST',
          body: JSON.stringify({
            influencerId: args.influencerId,
            name: args.name,
            description: args.description,
            outfitTop: args.outfitTop,
            outfitBottom: args.outfitBottom,
            outfitShoes: args.outfitShoes,
            outfitAccessories: args.outfitAccessories,
            outfitStyle: args.outfitStyle,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            preset: result,
            message: 'Outfit preset created',
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
   * Prompts detailed lookup
   */
  server.addTool({
    name: 'ryla_prompt_get',
    description: 'Get detailed information about a specific prompt by ID.',
    parameters: z.object({
      promptId: z.string().describe('Prompt ID'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          id: string;
          category: string;
          name: string;
          content: string;
          rating: string | null;
          tags: string[];
          usageCount: number;
        }>(`/prompts/${args.promptId}`);

        return JSON.stringify(
          {
            success: true,
            prompt: result,
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
   * Prompt favorites
   */
  server.addTool({
    name: 'ryla_prompt_favorites',
    description: 'Get user favorite prompts.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await apiCall<
          Array<{
            id: string;
            category: string;
            name: string;
            content: string;
          }>
        >('/prompts/favorites/list');

        return JSON.stringify(
          {
            success: true,
            favorites: result,
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
   * Toggle prompt favorite
   */
  server.addTool({
    name: 'ryla_prompt_favorite_toggle',
    description: 'Add or remove a prompt from favorites.',
    parameters: z.object({
      promptId: z.string().describe('Prompt ID'),
      favorite: z.boolean().describe('true to add, false to remove'),
    }),
    execute: async (args) => {
      try {
        const endpoint = `/prompts/${args.promptId}/favorite`;
        await apiCall(endpoint, {
          method: args.favorite ? 'POST' : 'DELETE',
        });

        return JSON.stringify({
          success: true,
          promptId: args.promptId,
          isFavorite: args.favorite,
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Top used prompts
   */
  server.addTool({
    name: 'ryla_prompts_top',
    description: 'Get top most-used prompts.',
    parameters: z.object({
      limit: z.number().min(1).max(50).default(10).describe('Number of prompts to return'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<
          Array<{
            id: string;
            category: string;
            name: string;
            usageCount: number;
          }>
        >(`/prompts/top/used?limit=${args.limit}`);

        return JSON.stringify(
          {
            success: true,
            topPrompts: result,
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

