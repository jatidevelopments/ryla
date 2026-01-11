/**
 * Template Service
 *
 * Business logic for template management, validation, and analytics.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import {
  TemplatesRepository,
  type TemplateFilters,
  type TemplatePagination,
  type TemplateListResult,
} from '@ryla/data/repositories/templates.repository';
import type { Template, TemplateConfig, NewTemplate } from '@ryla/data/schema';

export interface CreateTemplateInput {
  name: string;
  description?: string;
  previewImageId: string;
  config: TemplateConfig;
  isPublic?: boolean;
  tags?: string[];
  influencerId?: string;
  sourceJobId?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}

export class TemplateService {
  private templatesRepo: TemplatesRepository;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.templatesRepo = new TemplatesRepository(db);
  }

  /**
   * Create a new template
   */
  async create(userId: string, input: CreateTemplateInput): Promise<Template> {
    // Validate template name
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Template name is required');
    }
    if (input.name.length > 100) {
      throw new Error('Template name must be 100 characters or less');
    }

    // Validate description
    if (input.description && input.description.length > 500) {
      throw new Error('Template description must be 500 characters or less');
    }

    // Validate config
    this.validateConfig(input.config);

    // Get preview image URL (we'll need to fetch from images table)
    // For now, we'll assume previewImageId is already a URL or we'll need to resolve it
    // This will be handled in the API layer where we have access to image service

    // Validate tags
    if (input.tags && input.tags.length > 10) {
      throw new Error('Maximum 10 tags allowed');
    }
    if (input.tags) {
      for (const tag of input.tags) {
        if (tag.length > 20) {
          throw new Error('Each tag must be 20 characters or less');
        }
      }
    }

    // Create template
    const template = await this.templatesRepo.create({
      userId,
      influencerId: input.influencerId ?? null,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      previewImageUrl: input.previewImageId, // Will be resolved to URL in API layer
      thumbnailUrl: input.previewImageId, // Will be resolved to thumbnail URL in API layer
      config: input.config,
      sourceImageId: null, // Will be set if created from image
      sourceJobId: input.sourceJobId ?? null,
      isPublic: input.isPublic ?? false,
      isCurated: false,
      tags: input.tags ?? null,
      successRate: null,
    });

    return template;
  }

  /**
   * Find all templates with filters
   */
  async findAll(
    filters: TemplateFilters = {},
    pagination: TemplatePagination = {}
  ): Promise<TemplateListResult> {
    return this.templatesRepo.findAll(filters, pagination);
  }

  /**
   * Find template by ID
   */
  async findById(id: string): Promise<Template | null> {
    return this.templatesRepo.findById(id);
  }

  /**
   * Update template (with ownership check)
   */
  async update(
    userId: string,
    id: string,
    input: UpdateTemplateInput
  ): Promise<Template> {
    // Check ownership
    const template = await this.templatesRepo.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    if (template.userId !== userId) {
      throw new Error('You can only update your own templates');
    }

    // Validate updates
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        throw new Error('Template name is required');
      }
      if (input.name.length > 100) {
        throw new Error('Template name must be 100 characters or less');
      }
    }

    if (input.description !== undefined && input.description && input.description.length > 500) {
      throw new Error('Template description must be 500 characters or less');
    }

    if (input.tags) {
      if (input.tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      for (const tag of input.tags) {
        if (tag.length > 20) {
          throw new Error('Each tag must be 20 characters or less');
        }
      }
    }

    const updated = await this.templatesRepo.update(id, {
      name: input.name?.trim(),
      description: input.description?.trim(),
      isPublic: input.isPublic,
      tags: input.tags,
    });

    if (!updated) {
      throw new Error('Failed to update template');
    }

    return updated;
  }

  /**
   * Delete template (with ownership check)
   */
  async delete(userId: string, id: string): Promise<boolean> {
    // Check ownership
    const template = await this.templatesRepo.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    if (template.userId !== userId) {
      throw new Error('You can only delete your own templates');
    }

    return this.templatesRepo.delete(id);
  }

  /**
   * Apply template (returns config)
   */
  async apply(id: string): Promise<TemplateConfig> {
    const template = await this.templatesRepo.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check visibility (public or curated templates are visible to all)
    if (!template.isPublic && !template.isCurated && template.userId) {
      // User templates are only visible to creator (handled in API layer with auth)
      // For now, we'll allow access and let API layer handle auth
    }

    return template.config;
  }

  /**
   * Track template usage
   */
  async trackUsage(
    templateId: string,
    userId: string | null,
    jobId: string | null,
    generationSuccessful: boolean | null
  ): Promise<void> {
    // Track usage
    await this.templatesRepo.trackUsage(templateId, userId, jobId, generationSuccessful);

    // Increment usage count
    await this.templatesRepo.incrementUsageCount(templateId);

    // Update success rate (async, don't block)
    this.templatesRepo.updateSuccessRate(templateId).catch((err) => {
      console.error('Failed to update template success rate:', err);
    });
  }

  /**
   * Get template statistics
   */
  async getStats(id: string): Promise<{
    usageCount: number;
    successRate: number | null;
    recentUsage: Array<{
      userId: string | null;
      jobId: string | null;
      successful: boolean | null;
      createdAt: Date | null;
    }>;
  }> {
    return this.templatesRepo.getStats(id);
  }

  /**
   * Validate template config
   */
  private validateConfig(config: TemplateConfig): void {
    // Validate aspect ratio
    const validAspectRatios = ['1:1', '9:16', '2:3', '3:4', '4:3', '16:9', '3:2'];
    if (config.aspectRatio && !validAspectRatios.includes(config.aspectRatio)) {
      throw new Error(`Invalid aspect ratio: ${config.aspectRatio}`);
    }

    // Validate quality mode
    if (config.qualityMode && !['draft', 'hq'].includes(config.qualityMode)) {
      throw new Error(`Invalid quality mode: ${config.qualityMode}`);
    }

    // Validate model ID (should not be empty)
    if (!config.modelId || config.modelId.trim().length === 0) {
      throw new Error('Model ID is required');
    }

    // Validate objects array (max 3)
    if (config.objects && config.objects.length > 3) {
      throw new Error('Maximum 3 objects allowed');
    }
  }
}

