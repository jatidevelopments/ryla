/**
 * Template Likes Service
 *
 * Business logic for template likes and popularity.
 * Epic: EP-049 (Likes & Popularity System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import 'server-only';

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import {
  TemplateLikesRepository,
  type LikeResponse,
} from '@ryla/data/repositories/template-likes.repository';
import { TemplatesRepository } from '@ryla/data/repositories/templates.repository';
import { TemplateSetsRepository } from '@ryla/data/repositories/template-sets.repository';
import type { Template } from '@ryla/data/schema';

export interface SetLikeResponse {
  liked: boolean;
  likesCount: number;
}

export class TemplateLikesService {
  private likesRepo: TemplateLikesRepository;
  private templatesRepo: TemplatesRepository;
  private setsRepo: TemplateSetsRepository;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.likesRepo = new TemplateLikesRepository(db);
    this.templatesRepo = new TemplatesRepository(db);
    this.setsRepo = new TemplateSetsRepository(db);
  }

  /**
   * Like a template
   */
  async like(userId: string, templateId: string): Promise<LikeResponse> {
    // Check template exists
    const template = await this.templatesRepo.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if public or curated (only public templates can be liked by non-owners)
    if (
      !template.isPublic &&
      !template.isCurated &&
      template.userId !== userId
    ) {
      throw new Error('Cannot like private template');
    }

    return this.likesRepo.like(userId, templateId);
  }

  /**
   * Unlike a template
   */
  async unlike(userId: string, templateId: string): Promise<LikeResponse> {
    return this.likesRepo.unlike(userId, templateId);
  }

  /**
   * Toggle like status
   */
  async toggle(userId: string, templateId: string): Promise<LikeResponse> {
    // Check template exists
    const template = await this.templatesRepo.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if public or curated
    if (
      !template.isPublic &&
      !template.isCurated &&
      template.userId !== userId
    ) {
      throw new Error('Cannot like private template');
    }

    return this.likesRepo.toggle(userId, templateId);
  }

  /**
   * Check if user has liked a template
   */
  async isLiked(userId: string, templateId: string): Promise<boolean> {
    return this.likesRepo.isLiked(userId, templateId);
  }

  /**
   * Get like status for multiple templates
   */
  async getLikeStatuses(
    userId: string,
    templateIds: string[]
  ): Promise<Map<string, boolean>> {
    return this.likesRepo.getLikeStatuses(userId, templateIds);
  }

  /**
   * Get likes count for a template
   */
  async getLikesCount(templateId: string): Promise<number> {
    return this.likesRepo.getLikesCount(templateId);
  }

  /**
   * Get template IDs liked by user
   */
  async getLikedTemplateIds(userId: string): Promise<string[]> {
    return this.likesRepo.getLikedTemplateIds(userId);
  }

  /**
   * Get templates liked by user
   */
  async getLikedTemplates(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<Template[]> {
    return this.likesRepo.getLikedTemplates(userId, limit, offset);
  }

  /**
   * Count total likes by user
   */
  async countUserLikes(userId: string): Promise<number> {
    return this.likesRepo.countUserLikes(userId);
  }

  // ==================== TEMPLATE SET LIKES ====================

  /**
   * Like a template set
   */
  async likeSet(userId: string, setId: string): Promise<SetLikeResponse> {
    // Check set exists
    const set = await this.setsRepo.findById(setId);
    if (!set) {
      throw new Error('Template set not found');
    }

    // Check if public or curated (only public sets can be liked by non-owners)
    if (!set.isPublic && !set.isCurated && set.userId !== userId) {
      throw new Error('Cannot like private template set');
    }

    // Check if already liked
    const alreadyLiked = await this.setsRepo.hasUserLiked(setId, userId);
    if (alreadyLiked) {
      return {
        liked: true,
        likesCount: set.likesCount,
      };
    }

    await this.setsRepo.addLike(setId, userId);

    return {
      liked: true,
      likesCount: set.likesCount + 1,
    };
  }

  /**
   * Unlike a template set
   */
  async unlikeSet(userId: string, setId: string): Promise<SetLikeResponse> {
    const set = await this.setsRepo.findById(setId);
    const wasLiked = await this.setsRepo.removeLike(setId, userId);

    return {
      liked: false,
      likesCount: Math.max(0, (set?.likesCount ?? 1) - (wasLiked ? 1 : 0)),
    };
  }

  /**
   * Toggle like status for a template set
   */
  async toggleSetLike(userId: string, setId: string): Promise<SetLikeResponse> {
    const set = await this.setsRepo.findById(setId);
    if (!set) {
      throw new Error('Template set not found');
    }

    // Check if public or curated
    if (!set.isPublic && !set.isCurated && set.userId !== userId) {
      throw new Error('Cannot like private template set');
    }

    const isLiked = await this.setsRepo.hasUserLiked(setId, userId);

    if (isLiked) {
      await this.setsRepo.removeLike(setId, userId);
      return {
        liked: false,
        likesCount: Math.max(0, set.likesCount - 1),
      };
    } else {
      await this.setsRepo.addLike(setId, userId);
      return {
        liked: true,
        likesCount: set.likesCount + 1,
      };
    }
  }

  /**
   * Check if user has liked a template set
   */
  async isSetLiked(userId: string, setId: string): Promise<boolean> {
    return this.setsRepo.hasUserLiked(setId, userId);
  }

  /**
   * Get set IDs liked by user
   */
  async getLikedSetIds(userId: string): Promise<string[]> {
    return this.setsRepo.getUserLikedSetIds(userId);
  }

  /**
   * Get like statuses for multiple sets
   */
  async getSetLikeStatuses(
    userId: string,
    setIds: string[]
  ): Promise<Map<string, boolean>> {
    const likedIds = await this.setsRepo.getUserLikedSetIds(userId);
    const likedSet = new Set(likedIds);

    const result = new Map<string, boolean>();
    for (const id of setIds) {
      result.set(id, likedSet.has(id));
    }
    return result;
  }
}
