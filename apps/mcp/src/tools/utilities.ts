/**
 * Utility Tools
 *
 * General utility tools for:
 * - Health checks
 * - Credits management
 * - System information
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { apiCall } from '../api-client.js';

export function registerUtilityTools(server: FastMCP) {
  /**
   * API Health Check
   */
  server.addTool({
    name: 'ryla_health_check',
    description: 'Check RYLA API health status and service availability.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await apiCall<{
          status: string;
          timestamp: string;
          version: string;
          services: Record<string, string>;
        }>('/health');

        return JSON.stringify(
          {
            success: true,
            health: result,
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'API is not reachable. Make sure the API server is running.',
        });
      }
    },
  });

  /**
   * Image Generation Health Check
   */
  server.addTool({
    name: 'ryla_image_health',
    description:
      'Check image generation service health including ComfyUI pod availability.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await apiCall<{
          comfyui: boolean;
          recommendedWorkflow: string;
        }>('/image/health');

        return JSON.stringify(
          {
            success: true,
            imageService: {
              comfyuiAvailable: result.comfyui,
              recommendedWorkflow: result.recommendedWorkflow,
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
   * Get user credits
   */
  server.addTool({
    name: 'ryla_credits_balance',
    description: 'Get current user credit balance and usage statistics.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await apiCall<{
          balance: number;
          totalSpent: number;
          totalEarned: number;
          lastRefresh: string | null;
        }>('/credits/balance');

        return JSON.stringify(
          {
            success: true,
            credits: result,
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
   * Get credit transaction history
   */
  server.addTool({
    name: 'ryla_credits_history',
    description: 'Get credit transaction history showing usage and refunds.',
    parameters: z.object({
      limit: z.number().min(1).max(100).default(20).describe('Number of transactions to return'),
      offset: z.number().min(0).default(0).describe('Offset for pagination'),
    }),
    execute: async (args) => {
      try {
        const params = new URLSearchParams();
        params.set('limit', String(args.limit));
        params.set('offset', String(args.offset));

        const result = await apiCall<{
          items: Array<{
            id: string;
            type: string;
            amount: number;
            balanceAfter: number;
            description: string;
            createdAt: string;
          }>;
          total: number;
        }>(`/credits/transactions?${params.toString()}`);

        return JSON.stringify(
          {
            success: true,
            total: result.total,
            transactions: result.items,
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
   * Get user profile
   */
  server.addTool({
    name: 'ryla_user_profile',
    description: 'Get current authenticated user profile information.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await apiCall<{
          id: string;
          email: string;
          displayName: string | null;
          role: string;
          createdAt: string;
        }>('/user/me');

        return JSON.stringify(
          {
            success: true,
            user: result,
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
   * List available prompts/presets
   */
  server.addTool({
    name: 'ryla_prompts_list',
    description:
      'List available prompt presets for different categories (poses, scenes, outfits, etc.).',
    parameters: z.object({
      category: z
        .enum([
          'pose',
          'scene',
          'environment',
          'outfit',
          'lighting',
          'expression',
          'style',
        ])
        .optional()
        .describe('Filter by category'),
      search: z.string().optional().describe('Search in prompt name/content'),
      limit: z.number().min(1).max(100).default(50).describe('Max results'),
    }),
    execute: async (args) => {
      try {
        const params = new URLSearchParams();
        if (args.category) params.set('category', args.category);
        if (args.search) params.set('search', args.search);
        params.set('limit', String(args.limit));

        const result = await apiCall<{
          items: Array<{
            id: string;
            category: string;
            name: string;
            content: string;
            tags: string[];
          }>;
          total: number;
        }>(`/prompts?${params.toString()}`);

        return JSON.stringify(
          {
            success: true,
            total: result.total,
            prompts: result.items,
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
   * Get feature costs
   */
  server.addTool({
    name: 'ryla_feature_costs',
    description: 'Get credit costs for different features and operations.',
    parameters: z.object({}),
    execute: async () => {
      // Return static feature costs from shared config
      const costs = {
        studio_fast: 2,
        studio_standard: 5,
        studio_hq: 10,
        base_generation: 3,
        face_swap: 5,
        upscale: 20,
        inpaint: 8,
      };

      return JSON.stringify(
        {
          success: true,
          costs,
          note: 'Costs are in credits per operation. Some operations may multiply by count.',
        },
        null,
        2
      );
    },
  });
}

