/**
 * Template Tag Service
 *
 * Business logic for tag management and template-tag operations.
 * Epic: EP-048 (Category & Tag System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import {
  TemplateTagsRepository,
  type TagFilters,
  type TagPagination,
  type TagListResult,
} from '@ryla/data/repositories/template-tags.repository';
import { TemplatesRepository } from '@ryla/data/repositories/templates.repository';
import type { TemplateTag } from '@ryla/data/schema';

// Constants
const MAX_TAGS_PER_TEMPLATE = 15;
const MAX_TAG_NAME_LENGTH = 50;
const MIN_TAG_NAME_LENGTH = 2;

export class TemplateTagService {
  private tagsRepo: TemplateTagsRepository;
  private templatesRepo: TemplatesRepository;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.tagsRepo = new TemplateTagsRepository(db);
    this.templatesRepo = new TemplatesRepository(db);
  }

  /**
   * Get all tags with optional filters
   */
  async getAll(
    filters: TagFilters = {},
    pagination: TagPagination = {}
  ): Promise<TagListResult> {
    return this.tagsRepo.findAll(filters, pagination);
  }

  /**
   * Get popular tags
   */
  async getPopular(limit = 20): Promise<TemplateTag[]> {
    return this.tagsRepo.getPopular(limit);
  }

  /**
   * Get tag by ID
   */
  async getById(id: string): Promise<TemplateTag | null> {
    return this.tagsRepo.findById(id);
  }

  /**
   * Get tag by name
   */
  async getByName(name: string): Promise<TemplateTag | null> {
    return this.tagsRepo.findByName(name);
  }

  /**
   * Get tags for a template
   */
  async getByTemplateId(templateId: string): Promise<TemplateTag[]> {
    return this.tagsRepo.findByTemplateId(templateId);
  }

  /**
   * Add tag to template (with ownership check)
   */
  async addToTemplate(
    userId: string,
    templateId: string,
    tagName: string
  ): Promise<{ tag: TemplateTag; created: boolean }> {
    // Validate tag name
    const normalizedName = tagName.trim().toLowerCase();
    if (normalizedName.length < MIN_TAG_NAME_LENGTH) {
      throw new Error(`Tag name must be at least ${MIN_TAG_NAME_LENGTH} characters`);
    }
    if (normalizedName.length > MAX_TAG_NAME_LENGTH) {
      throw new Error(`Tag name must be at most ${MAX_TAG_NAME_LENGTH} characters`);
    }

    // Check template ownership
    const template = await this.templatesRepo.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    if (template.userId !== userId) {
      throw new Error('You can only add tags to your own templates');
    }

    // Check tag limit
    const currentTags = await this.tagsRepo.findByTemplateId(templateId);
    if (currentTags.length >= MAX_TAGS_PER_TEMPLATE) {
      throw new Error(`Maximum ${MAX_TAGS_PER_TEMPLATE} tags per template`);
    }

    // Check if already tagged
    if (currentTags.some((t) => t.name.toLowerCase() === normalizedName)) {
      throw new Error('Template already has this tag');
    }

    // Find or create tag (user-created = not system)
    const { tag, created } = await this.tagsRepo.findOrCreate(normalizedName, false);

    // Assign to template
    await this.tagsRepo.assignToTemplate(templateId, tag.id);

    return { tag, created };
  }

  /**
   * Remove tag from template (with ownership check)
   */
  async removeFromTemplate(
    userId: string,
    templateId: string,
    tagId: string
  ): Promise<boolean> {
    // Check template ownership
    const template = await this.templatesRepo.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    if (template.userId !== userId) {
      throw new Error('You can only remove tags from your own templates');
    }

    return this.tagsRepo.removeFromTemplate(templateId, tagId);
  }

  /**
   * Set all tags for a template (replaces existing)
   * Used by AI auto-tagging and bulk updates
   */
  async setTemplateTags(
    templateId: string,
    tagNames: string[],
    isSystem = false
  ): Promise<TemplateTag[]> {
    // Validate tag count
    if (tagNames.length > MAX_TAGS_PER_TEMPLATE) {
      throw new Error(`Maximum ${MAX_TAGS_PER_TEMPLATE} tags per template`);
    }

    // Find or create all tags
    const tagIds: string[] = [];
    for (const name of tagNames) {
      const normalizedName = name.trim().toLowerCase();
      if (
        normalizedName.length >= MIN_TAG_NAME_LENGTH &&
        normalizedName.length <= MAX_TAG_NAME_LENGTH
      ) {
        const { tag } = await this.tagsRepo.findOrCreate(normalizedName, isSystem);
        tagIds.push(tag.id);
      }
    }

    // Set tags
    return this.tagsRepo.setTemplateTags(templateId, tagIds);
  }

  /**
   * Get template IDs by tag
   */
  async getTemplateIdsByTag(tagId: string): Promise<string[]> {
    return this.tagsRepo.findTemplateIdsByTagId(tagId);
  }

  /**
   * Get template IDs by multiple tags (OR logic)
   */
  async getTemplateIdsByTags(tagIds: string[]): Promise<string[]> {
    return this.tagsRepo.findTemplateIdsByTagIds(tagIds);
  }

  /**
   * Search tags by name
   */
  async search(query: string, limit = 10): Promise<TemplateTag[]> {
    const result = await this.tagsRepo.findAll(
      { search: query },
      { limit }
    );
    return result.tags;
  }

  // ==================== AI AUTO-TAGGING ====================
  // Note: The actual AI call would be handled separately
  // This method handles the assignment logic

  /**
   * Apply AI-generated tags to a template
   * Called after vision model analyzes the preview image
   */
  async applyAutoTags(
    templateId: string,
    suggestedTags: string[]
  ): Promise<TemplateTag[]> {
    // Normalize and filter tags
    const validTags = suggestedTags
      .map((t) => t.trim().toLowerCase())
      .filter(
        (t) =>
          t.length >= MIN_TAG_NAME_LENGTH && t.length <= MAX_TAG_NAME_LENGTH
      )
      .slice(0, 8); // AI provides 3-8 tags

    // Set as system-generated tags
    return this.setTemplateTags(templateId, validTags, true);
  }
}
