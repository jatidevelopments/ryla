/**
 * Template Likes Repository
 *
 * Manages template like operations and likes count tracking.
 * Epic: EP-049 (Likes & Popularity System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import { and, desc, eq, sql, inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import type { TemplateLike, Template } from '../schema';

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export class TemplateLikesRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Like a template
   */
  async like(userId: string, templateId: string): Promise<LikeResponse> {
    try {
      // Insert like
      await this.db
        .insert(schema.templateLikes)
        .values({ userId, templateId });

      // Increment likes count
      const [updated] = await this.db
        .update(schema.templates)
        .set({
          likesCount: sql`COALESCE(${schema.templates.likesCount}, 0) + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.templates.id, templateId))
        .returning({ likesCount: schema.templates.likesCount });

      return {
        liked: true,
        likesCount: updated?.likesCount ?? 1,
      };
    } catch {
      // Already liked - return current count
      const template = await this.db.query.templates.findFirst({
        where: eq(schema.templates.id, templateId),
        columns: { likesCount: true },
      });

      return {
        liked: true,
        likesCount: template?.likesCount ?? 0,
      };
    }
  }

  /**
   * Unlike a template
   */
  async unlike(userId: string, templateId: string): Promise<LikeResponse> {
    const result = await this.db
      .delete(schema.templateLikes)
      .where(
        and(
          eq(schema.templateLikes.userId, userId),
          eq(schema.templateLikes.templateId, templateId)
        )
      );

    if ((result.rowCount ?? 0) > 0) {
      // Decrement likes count
      const [updated] = await this.db
        .update(schema.templates)
        .set({
          likesCount: sql`GREATEST(COALESCE(${schema.templates.likesCount}, 0) - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(schema.templates.id, templateId))
        .returning({ likesCount: schema.templates.likesCount });

      return {
        liked: false,
        likesCount: updated?.likesCount ?? 0,
      };
    }

    // Not liked - return current count
    const template = await this.db.query.templates.findFirst({
      where: eq(schema.templates.id, templateId),
      columns: { likesCount: true },
    });

    return {
      liked: false,
      likesCount: template?.likesCount ?? 0,
    };
  }

  /**
   * Toggle like (like if not liked, unlike if liked)
   */
  async toggle(userId: string, templateId: string): Promise<LikeResponse> {
    const isLiked = await this.isLiked(userId, templateId);
    if (isLiked) {
      return this.unlike(userId, templateId);
    } else {
      return this.like(userId, templateId);
    }
  }

  /**
   * Check if user has liked a template
   */
  async isLiked(userId: string, templateId: string): Promise<boolean> {
    const like = await this.db.query.templateLikes.findFirst({
      where: and(
        eq(schema.templateLikes.userId, userId),
        eq(schema.templateLikes.templateId, templateId)
      ),
    });
    return like !== undefined && like !== null;
  }

  /**
   * Get likes count for a template
   */
  async getLikesCount(templateId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.templateLikes)
      .where(eq(schema.templateLikes.templateId, templateId));

    return Number(result[0]?.count ?? 0);
  }

  /**
   * Get all template IDs liked by a user
   */
  async getLikedTemplateIds(userId: string): Promise<string[]> {
    const likes = await this.db.query.templateLikes.findMany({
      where: eq(schema.templateLikes.userId, userId),
      columns: { templateId: true },
      orderBy: [desc(schema.templateLikes.createdAt)],
    });

    return likes.map((l) => l.templateId);
  }

  /**
   * Get templates liked by a user with pagination
   */
  async getLikedTemplates(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<Template[]> {
    const likedIds = await this.db.query.templateLikes.findMany({
      where: eq(schema.templateLikes.userId, userId),
      columns: { templateId: true },
      orderBy: [desc(schema.templateLikes.createdAt)],
      limit,
      offset,
    });

    if (likedIds.length === 0) return [];

    const templateIds = likedIds.map((l) => l.templateId);
    return this.db.query.templates.findMany({
      where: inArray(schema.templates.id, templateIds),
    });
  }

  /**
   * Get like status for multiple templates
   */
  async getLikeStatuses(
    userId: string,
    templateIds: string[]
  ): Promise<Map<string, boolean>> {
    if (templateIds.length === 0) return new Map();

    const likes = await this.db.query.templateLikes.findMany({
      where: and(
        eq(schema.templateLikes.userId, userId),
        inArray(schema.templateLikes.templateId, templateIds)
      ),
      columns: { templateId: true },
    });

    const likedSet = new Set(likes.map((l) => l.templateId));
    const result = new Map<string, boolean>();
    
    for (const id of templateIds) {
      result.set(id, likedSet.has(id));
    }

    return result;
  }

  /**
   * Get recent likes for a template
   */
  async getRecentLikes(
    templateId: string,
    limit = 10
  ): Promise<TemplateLike[]> {
    return this.db.query.templateLikes.findMany({
      where: eq(schema.templateLikes.templateId, templateId),
      orderBy: [desc(schema.templateLikes.createdAt)],
      limit,
    });
  }

  /**
   * Count total likes by a user
   */
  async countUserLikes(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.templateLikes)
      .where(eq(schema.templateLikes.userId, userId));

    return Number(result[0]?.count ?? 0);
  }
}
