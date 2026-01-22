/**
 * Template Management Tools
 *
 * Tools for managing generation templates:
 * - List templates with filters
 * - Get template details
 * - Create templates from successful generations
 * - Apply templates to get configuration
 * - Track template usage
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { apiCall } from '../api-client.js';

// Template config schema for creation
// qualityMode removed - EP-045
const templateConfigSchema = z.object({
  scene: z.string().nullable().optional(),
  environment: z.string().nullable().optional(),
  outfit: z.union([z.string(), z.record(z.unknown())]).nullable().optional(),
  aspectRatio: z.enum(['1:1', '9:16', '2:3', '3:4', '4:3', '16:9', '3:2']).default('9:16'),
  nsfw: z.boolean().default(false),
  poseId: z.string().nullable().optional(),
  styleId: z.string().nullable().optional(),
  lightingId: z.string().nullable().optional(),
  modelId: z.string().default('comfyui-default'),
  prompt: z.string().optional(),
  promptEnhance: z.boolean().optional(),
});

export function registerTemplateTools(server: FastMCP) {
  /**
   * List templates
   */
  server.addTool({
    name: 'ryla_template_list',
    description: `List available templates with optional filters. Templates are pre-configured generation settings that can be applied to quickly generate consistent content.
    
Categories:
- all: All visible templates
- my_templates: User's own templates
- curated: Staff-curated templates
- popular: Most-used templates`,
    parameters: z.object({
      category: z
        .enum(['all', 'my_templates', 'curated', 'popular'])
        .default('all')
        .describe('Template category filter'),
      scene: z.string().optional().describe('Filter by scene'),
      environment: z.string().optional().describe('Filter by environment'),
      aspectRatio: z.string().optional().describe('Filter by aspect ratio'),
      // qualityMode removed - EP-045
      nsfw: z.boolean().optional().describe('Filter by NSFW flag'),
      search: z.string().optional().describe('Search in template name/description'),
      influencerId: z.string().uuid().optional().describe('Filter by influencer/character ID'),
      page: z.number().min(1).default(1).describe('Page number'),
      limit: z.number().min(1).max(100).default(20).describe('Items per page'),
    }),
    execute: async (args) => {
      try {
        const params = new URLSearchParams();
        if (args.category) params.set('category', args.category);
        if (args.scene) params.set('scene', args.scene);
        if (args.environment) params.set('environment', args.environment);
        if (args.aspectRatio) params.set('aspectRatio', args.aspectRatio);
        // qualityMode removed - EP-045
        if (args.nsfw !== undefined) params.set('nsfw', String(args.nsfw));
        if (args.search) params.set('search', args.search);
        if (args.influencerId) params.set('influencerId', args.influencerId);
        params.set('page', String(args.page));
        params.set('limit', String(args.limit));

        const result = await apiCall<{
          items: Array<{
            id: string;
            name: string;
            description: string | null;
            previewImageUrl: string | null;
            usageCount: number;
            successRate: number | null;
            isCurated: boolean;
            isPublic: boolean;
          }>;
          total: number;
          page: number;
          limit: number;
        }>(`/templates?${params.toString()}`);

        return JSON.stringify(
          {
            success: true,
            total: result.total,
            page: result.page,
            limit: result.limit,
            templates: result.items.map((t) => ({
              id: t.id,
              name: t.name,
              description: t.description,
              usageCount: t.usageCount,
              successRate: t.successRate,
              isCurated: t.isCurated,
              isPublic: t.isPublic,
              hasPreview: !!t.previewImageUrl,
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
   * Get template by ID
   */
  server.addTool({
    name: 'ryla_template_get',
    description: 'Get detailed template information including full configuration.',
    parameters: z.object({
      templateId: z.string().uuid().describe('The template UUID'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          template: {
            id: string;
            name: string;
            description: string | null;
            config: Record<string, unknown>;
            previewImageUrl: string | null;
            usageCount: number;
            successRate: number | null;
            tags: string[];
            createdAt: string;
          };
        }>(`/templates/${args.templateId}`);

        return JSON.stringify(
          {
            success: true,
            template: result.template,
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
   * Create a template
   */
  server.addTool({
    name: 'ryla_template_create',
    description: `Create a new template from generation configuration. Use this to save successful generation settings for reuse.
    
Best practice: After a successful generation, use the same settings to create a template for future use.`,
    parameters: z.object({
      name: z.string().min(1).max(100).describe('Template name'),
      description: z.string().max(500).optional().describe('Template description'),
      previewImageId: z.string().uuid().describe('Image ID to use as preview'),
      config: templateConfigSchema.describe('Template configuration'),
      isPublic: z.boolean().default(false).describe('Make template publicly visible'),
      tags: z.array(z.string().max(20)).max(10).optional().describe('Template tags'),
      influencerId: z.string().uuid().optional().describe('Associated character/influencer ID'),
      sourceJobId: z.string().uuid().optional().describe('Source generation job ID'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          template: {
            id: string;
            name: string;
          };
        }>('/templates', {
          method: 'POST',
          body: JSON.stringify({
            name: args.name,
            description: args.description,
            previewImageId: args.previewImageId,
            config: args.config,
            isPublic: args.isPublic,
            tags: args.tags,
            influencerId: args.influencerId,
            sourceJobId: args.sourceJobId,
          }),
        });

        return JSON.stringify(
          {
            success: true,
            template: result.template,
            message: 'Template created successfully',
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
   * Apply template
   */
  server.addTool({
    name: 'ryla_template_apply',
    description: `Apply a template to get its configuration. Returns the template config that can be used with ryla_generate_studio.
    
Workflow: ryla_template_get -> extract config -> ryla_generate_studio`,
    parameters: z.object({
      templateId: z.string().uuid().describe('The template UUID to apply'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          config: Record<string, unknown>;
        }>(`/templates/${args.templateId}/apply`);

        return JSON.stringify(
          {
            success: true,
            config: result.config,
            message: 'Template configuration retrieved. Use with ryla_generate_studio.',
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
   * Get template stats
   */
  server.addTool({
    name: 'ryla_template_stats',
    description: 'Get usage statistics for a template including usage count and success rate.',
    parameters: z.object({
      templateId: z.string().uuid().describe('The template UUID'),
    }),
    execute: async (args) => {
      try {
        const result = await apiCall<{
          usageCount: number;
          successfulGenerations: number;
          failedGenerations: number;
          successRate: number | null;
          lastUsed: string | null;
        }>(`/templates/${args.templateId}/stats`);

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
   * Delete template
   */
  server.addTool({
    name: 'ryla_template_delete',
    description: 'Delete a template. Only the owner can delete their templates.',
    parameters: z.object({
      templateId: z.string().uuid().describe('The template UUID to delete'),
    }),
    execute: async (args) => {
      try {
        await apiCall(`/templates/${args.templateId}`, {
          method: 'DELETE',
        });

        return JSON.stringify(
          {
            success: true,
            message: 'Template deleted successfully',
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

