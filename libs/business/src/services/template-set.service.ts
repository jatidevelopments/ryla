/**
 * Template Set Service
 *
 * Business logic for template set management, validation, and analytics.
 * Epic: EP-046 (Template Sets Data Model & API)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import {
  TemplateSetsRepository,
  type TemplateSetFilters,
  type TemplateSetPagination,
  type TemplateSetListResult,
  type TemplateSetWithMembers,
  type SortOption,
} from '@ryla/data/repositories/template-sets.repository';
import { TemplatesRepository } from '@ryla/data/repositories/templates.repository';
import type {
  TemplateSet,
  TemplateSetContentType,
  TemplateConfig,
} from '@ryla/data/schema';

// Constants
const MAX_SET_NAME_LENGTH = 100;
const MAX_SET_DESCRIPTION_LENGTH = 500;
const MIN_SET_MEMBERS = 1;
const MAX_SET_MEMBERS = 20;

export interface CreateTemplateSetInput {
  name: string;
  description?: string;
  templateIds: string[]; // Order determines position
  isPublic?: boolean;
  previewImageUrl?: string;
  thumbnailUrl?: string;
}

export interface UpdateTemplateSetInput {
  name?: string;
  description?: string;
  templateIds?: string[]; // Full replacement if provided
  isPublic?: boolean;
  previewImageUrl?: string;
  thumbnailUrl?: string;
}

export interface ApplyTemplateSetResult {
  set: TemplateSet;
  configs: TemplateConfig[];
}

export class TemplateSetService {
  private templateSetsRepo: TemplateSetsRepository;
  private templatesRepo: TemplatesRepository;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.templateSetsRepo = new TemplateSetsRepository(db);
    this.templatesRepo = new TemplatesRepository(db);
  }

  /**
   * Create a new template set
   */
  async create(userId: string, input: CreateTemplateSetInput): Promise<TemplateSetWithMembers> {
    // Validate name
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Template set name is required');
    }
    if (input.name.length > MAX_SET_NAME_LENGTH) {
      throw new Error(`Template set name must be ${MAX_SET_NAME_LENGTH} characters or less`);
    }

    // Validate description
    if (input.description && input.description.length > MAX_SET_DESCRIPTION_LENGTH) {
      throw new Error(
        `Template set description must be ${MAX_SET_DESCRIPTION_LENGTH} characters or less`
      );
    }

    // Validate member count
    if (!input.templateIds || input.templateIds.length < MIN_SET_MEMBERS) {
      throw new Error(`Template set must have at least ${MIN_SET_MEMBERS} template(s)`);
    }
    if (input.templateIds.length > MAX_SET_MEMBERS) {
      throw new Error(`Template set can have maximum ${MAX_SET_MEMBERS} templates`);
    }

    // Validate templates exist
    for (const templateId of input.templateIds) {
      const template = await this.templatesRepo.findById(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }
    }

    // Determine content type from templates
    const contentType = await this.determineContentType(input.templateIds);

    // Use first template's preview as set preview if not provided
    let previewImageUrl = input.previewImageUrl;
    let thumbnailUrl = input.thumbnailUrl;
    if (!previewImageUrl && input.templateIds.length > 0) {
      const firstTemplate = await this.templatesRepo.findById(input.templateIds[0]);
      if (firstTemplate) {
        previewImageUrl = firstTemplate.previewImageUrl;
        thumbnailUrl = firstTemplate.thumbnailUrl;
      }
    }

    // Create the set
    const set = await this.templateSetsRepo.create({
      userId,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      previewImageUrl: previewImageUrl ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
      isPublic: input.isPublic ?? false,
      isCurated: false,
      contentType,
    });

    // Add members
    await this.templateSetsRepo.setMembers(set.id, input.templateIds);

    // Return set with members
    const result = await this.templateSetsRepo.findByIdWithMembers(set.id);
    if (!result) {
      throw new Error('Failed to create template set');
    }

    // TODO: Emit analytics event - template_set_created

    return result;
  }

  /**
   * Find all template sets with filters
   */
  async findAll(
    filters: TemplateSetFilters = {},
    pagination: TemplateSetPagination = {},
    sort: SortOption = 'popular'
  ): Promise<TemplateSetListResult> {
    return this.templateSetsRepo.findAll(filters, pagination, sort);
  }

  /**
   * Find template set by ID
   */
  async findById(id: string): Promise<TemplateSet | null> {
    return this.templateSetsRepo.findById(id);
  }

  /**
   * Find template set by ID with members
   */
  async findByIdWithMembers(id: string): Promise<TemplateSetWithMembers | null> {
    return this.templateSetsRepo.findByIdWithMembers(id);
  }

  /**
   * Update template set (with ownership check)
   */
  async update(
    userId: string,
    id: string,
    input: UpdateTemplateSetInput
  ): Promise<TemplateSetWithMembers> {
    // Check ownership
    const set = await this.templateSetsRepo.findById(id);
    if (!set) {
      throw new Error('Template set not found');
    }
    if (set.userId !== userId) {
      throw new Error('You can only update your own template sets');
    }

    // Validate name
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        throw new Error('Template set name is required');
      }
      if (input.name.length > MAX_SET_NAME_LENGTH) {
        throw new Error(`Template set name must be ${MAX_SET_NAME_LENGTH} characters or less`);
      }
    }

    // Validate description
    if (
      input.description !== undefined &&
      input.description &&
      input.description.length > MAX_SET_DESCRIPTION_LENGTH
    ) {
      throw new Error(
        `Template set description must be ${MAX_SET_DESCRIPTION_LENGTH} characters or less`
      );
    }

    // Validate and update members if provided
    if (input.templateIds !== undefined) {
      if (input.templateIds.length < MIN_SET_MEMBERS) {
        throw new Error(`Template set must have at least ${MIN_SET_MEMBERS} template(s)`);
      }
      if (input.templateIds.length > MAX_SET_MEMBERS) {
        throw new Error(`Template set can have maximum ${MAX_SET_MEMBERS} templates`);
      }

      // Validate templates exist
      for (const templateId of input.templateIds) {
        const template = await this.templatesRepo.findById(templateId);
        if (!template) {
          throw new Error(`Template ${templateId} not found`);
        }
      }

      // Update members
      await this.templateSetsRepo.setMembers(id, input.templateIds);

      // Recalculate content type
      const contentType = await this.determineContentType(input.templateIds);
      await this.templateSetsRepo.update(id, { contentType });
    }

    // Update set metadata
    await this.templateSetsRepo.update(id, {
      name: input.name?.trim(),
      description: input.description?.trim(),
      isPublic: input.isPublic,
      previewImageUrl: input.previewImageUrl,
      thumbnailUrl: input.thumbnailUrl,
    });

    // Return updated set with members
    const result = await this.templateSetsRepo.findByIdWithMembers(id);
    if (!result) {
      throw new Error('Failed to update template set');
    }

    // TODO: Emit analytics event - template_set_updated

    return result;
  }

  /**
   * Delete template set (with ownership check)
   */
  async delete(userId: string, id: string): Promise<boolean> {
    // Check ownership
    const set = await this.templateSetsRepo.findById(id);
    if (!set) {
      throw new Error('Template set not found');
    }
    if (set.userId !== userId) {
      throw new Error('You can only delete your own template sets');
    }

    const deleted = await this.templateSetsRepo.delete(id);

    // TODO: Emit analytics event - template_set_deleted

    return deleted;
  }

  /**
   * Apply template set (returns array of template configs)
   */
  async apply(id: string): Promise<ApplyTemplateSetResult> {
    const setWithMembers = await this.templateSetsRepo.findByIdWithMembers(id);
    if (!setWithMembers) {
      throw new Error('Template set not found');
    }

    // Extract configs from members in order
    const configs: TemplateConfig[] = setWithMembers.members.map(
      (member) => member.template.config
    );

    // Increment usage count
    await this.templateSetsRepo.incrementUsageCount(id);

    // TODO: Emit analytics event - template_set_applied

    return {
      set: setWithMembers,
      configs,
    };
  }

  /**
   * Add member to set (with ownership check)
   */
  async addMember(
    userId: string,
    setId: string,
    templateId: string
  ): Promise<TemplateSetWithMembers> {
    // Check ownership
    const set = await this.templateSetsRepo.findByIdWithMembers(setId);
    if (!set) {
      throw new Error('Template set not found');
    }
    if (set.userId !== userId) {
      throw new Error('You can only modify your own template sets');
    }

    // Check member limit
    if (set.members.length >= MAX_SET_MEMBERS) {
      throw new Error(`Template set can have maximum ${MAX_SET_MEMBERS} templates`);
    }

    // Check template exists
    const template = await this.templatesRepo.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if already a member
    if (set.members.some((m) => m.templateId === templateId)) {
      throw new Error('Template is already in this set');
    }

    // Add member
    await this.templateSetsRepo.addMember(setId, templateId);

    // Recalculate content type
    const templateIds = [...set.members.map((m) => m.templateId), templateId];
    const contentType = await this.determineContentType(templateIds);
    await this.templateSetsRepo.update(setId, { contentType });

    // Return updated set
    const result = await this.templateSetsRepo.findByIdWithMembers(setId);
    if (!result) {
      throw new Error('Failed to add member to template set');
    }

    return result;
  }

  /**
   * Remove member from set (with ownership check)
   */
  async removeMember(
    userId: string,
    setId: string,
    templateId: string
  ): Promise<TemplateSetWithMembers> {
    // Check ownership
    const set = await this.templateSetsRepo.findByIdWithMembers(setId);
    if (!set) {
      throw new Error('Template set not found');
    }
    if (set.userId !== userId) {
      throw new Error('You can only modify your own template sets');
    }

    // Check minimum members
    if (set.members.length <= MIN_SET_MEMBERS) {
      throw new Error(`Template set must have at least ${MIN_SET_MEMBERS} template(s)`);
    }

    // Remove member
    const removed = await this.templateSetsRepo.removeMember(setId, templateId);
    if (!removed) {
      throw new Error('Template not found in set');
    }

    // Recalculate content type
    const templateIds = set.members
      .filter((m) => m.templateId !== templateId)
      .map((m) => m.templateId);
    const contentType = await this.determineContentType(templateIds);
    await this.templateSetsRepo.update(setId, { contentType });

    // Return updated set
    const result = await this.templateSetsRepo.findByIdWithMembers(setId);
    if (!result) {
      throw new Error('Failed to remove member from template set');
    }

    return result;
  }

  /**
   * Reorder members in set (with ownership check)
   */
  async reorderMembers(
    userId: string,
    setId: string,
    templateIds: string[]
  ): Promise<TemplateSetWithMembers> {
    // Check ownership
    const set = await this.templateSetsRepo.findById(setId);
    if (!set) {
      throw new Error('Template set not found');
    }
    if (set.userId !== userId) {
      throw new Error('You can only modify your own template sets');
    }

    // Reorder
    await this.templateSetsRepo.reorderMembers(setId, templateIds);

    // Return updated set
    const result = await this.templateSetsRepo.findByIdWithMembers(setId);
    if (!result) {
      throw new Error('Failed to reorder template set members');
    }

    return result;
  }

  // ==================== LIKES ====================

  /**
   * Like a template set
   */
  async like(userId: string, setId: string): Promise<boolean> {
    const set = await this.templateSetsRepo.findById(setId);
    if (!set) {
      throw new Error('Template set not found');
    }

    // Check if public (only public sets can be liked by others)
    if (!set.isPublic && set.userId !== userId) {
      throw new Error('Cannot like private template set');
    }

    const like = await this.templateSetsRepo.addLike(setId, userId);
    return like !== null;
  }

  /**
   * Unlike a template set
   */
  async unlike(userId: string, setId: string): Promise<boolean> {
    return this.templateSetsRepo.removeLike(setId, userId);
  }

  /**
   * Check if user has liked a set
   */
  async hasLiked(userId: string, setId: string): Promise<boolean> {
    return this.templateSetsRepo.hasUserLiked(setId, userId);
  }

  /**
   * Get user's liked set IDs
   */
  async getUserLikedSetIds(userId: string): Promise<string[]> {
    return this.templateSetsRepo.getUserLikedSetIds(userId);
  }

  // ==================== HELPERS ====================

  /**
   * Determine content type from template IDs
   * Currently returns 'image' as we only support images
   * TODO: Extend when video/lip_sync/audio templates are added
   */
  private async determineContentType(
    _templateIds: string[]
  ): Promise<TemplateSetContentType> {
    // For now, all templates are image templates
    // When we add video/lip_sync/audio templates, we'll need to check each template's type
    // and return 'mixed' if they differ
    return 'image';
  }
}
