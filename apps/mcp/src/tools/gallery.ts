/**
 * Gallery Management Tools
 *
 * Tools for managing generated images:
 * - List images in gallery
 * - Favorite/unfavorite images
 * - Delete images
 * - Get image details
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { apiCall } from '../api-client.js';

export function registerGalleryTools(server: FastMCP) {
  /**
   * List gallery images
   */
  server.addTool({
    name: 'ryla_gallery_list',
    description: `List generated images in the user's gallery. Can filter by character, favorites, or status.`,
    parameters: z.object({
      characterId: z.string().uuid().optional().describe('Filter by character ID'),
      favoritesOnly: z.boolean().default(false).describe('Only show favorited images'),
      status: z
        .enum(['pending', 'processing', 'completed', 'failed'])
        .optional()
        .describe('Filter by image status'),
      limit: z.number().min(1).max(100).default(20).describe('Max results'),
      offset: z.number().min(0).default(0).describe('Offset for pagination'),
      sortBy: z
        .enum(['createdAt', 'updatedAt'])
        .default('createdAt')
        .describe('Sort field'),
      sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort order'),
    }),
    execute: async (args) => {
      try {
        const params = new URLSearchParams();
        if (args.characterId) params.set('characterId', args.characterId);
        if (args.favoritesOnly) params.set('favoritesOnly', 'true');
        if (args.status) params.set('status', args.status);
        params.set('limit', String(args.limit));
        params.set('offset', String(args.offset));
        params.set('sortBy', args.sortBy);
        params.set('sortOrder', args.sortOrder);

        const result = await apiCall<{
          items: Array<{
            id: string;
            url: string;
            thumbnailUrl: string | null;
            characterId: string | null;
            status: string;
            isFavorite: boolean;
            metadata: Record<string, unknown>;
            createdAt: string;
          }>;
          total: number;
        }>(`/gallery?${params.toString()}`);

        return JSON.stringify(
          {
            success: true,
            total: result.total,
            images: result.items.map((img) => ({
              id: img.id,
              url: img.url,
              thumbnailUrl: img.thumbnailUrl,
              characterId: img.characterId,
              status: img.status,
              isFavorite: img.isFavorite,
              createdAt: img.createdAt,
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
   * Get image details
   */
  server.addTool({
    name: 'ryla_gallery_get',
    description: 'Get detailed information about a specific image including generation metadata.',
    parameters: z.object({
      imageId: z.string().uuid().describe('The image UUID'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          id: string;
          url: string;
          thumbnailUrl: string | null;
          characterId: string | null;
          jobId: string | null;
          status: string;
          isFavorite: boolean;
          metadata: Record<string, unknown>;
          generationParams: Record<string, unknown>;
          createdAt: string;
          updatedAt: string;
        }>(`/gallery/${args.imageId}`);

        return JSON.stringify(
          {
            success: true,
            image: result,
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
   * Toggle favorite
   */
  server.addTool({
    name: 'ryla_gallery_favorite',
    description: 'Toggle favorite status for an image.',
    parameters: z.object({
      imageId: z.string().uuid().describe('The image UUID'),
      favorite: z.boolean().describe('Set favorite status (true=favorite, false=unfavorite)'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          id: string;
          isFavorite: boolean;
        }>(`/gallery/${args.imageId}/favorite`, {
          method: 'POST',
          body: JSON.stringify({ favorite: args.favorite }),
        });

        return JSON.stringify(
          {
            success: true,
            imageId: result.id,
            isFavorite: result.isFavorite,
            message: args.favorite ? 'Image added to favorites' : 'Image removed from favorites',
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
   * Delete image
   */
  server.addTool({
    name: 'ryla_gallery_delete',
    description: 'Delete an image from the gallery. This action cannot be undone.',
    parameters: z.object({
      imageId: z.string().uuid().describe('The image UUID to delete'),
    }),
    execute: async (args) => {
      try {
        await apiCall(`/gallery/${args.imageId}`, {
          method: 'DELETE',
        });

        return JSON.stringify(
          {
            success: true,
            message: 'Image deleted successfully',
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
   * Get gallery statistics
   */
  server.addTool({
    name: 'ryla_gallery_stats',
    description: "Get statistics about the user's gallery including counts by status and character.",
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await apiCall<{
          totalImages: number;
          completedImages: number;
          favoriteImages: number;
          imagesByCharacter: Array<{
            characterId: string;
            characterName: string;
            count: number;
          }>;
        }>('/gallery/stats');

        return JSON.stringify(
          {
            success: true,
            stats: result,
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
   * Batch operations
   */
  server.addTool({
    name: 'ryla_gallery_batch_delete',
    description: 'Delete multiple images at once. Use with caution.',
    parameters: z.object({
      imageIds: z
        .array(z.string().uuid())
        .min(1)
        .max(50)
        .describe('Array of image UUIDs to delete (max 50)'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          deleted: number;
          failed: number;
          errors: string[];
        }>('/gallery/batch/delete', {
          method: 'POST',
          body: JSON.stringify({ imageIds: args.imageIds }),
        });

        return JSON.stringify(
          {
            success: result.failed === 0,
            deleted: result.deleted,
            failed: result.failed,
            errors: result.errors,
            message: `Deleted ${result.deleted} images${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
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

