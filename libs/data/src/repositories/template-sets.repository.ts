/**
 * Template Sets Repository
 *
 * Manages template set CRUD operations, member management, and likes.
 * Epic: EP-046 (Template Sets Data Model & API)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import { and, desc, eq, or, sql, ilike, asc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import type {
  TemplateSet,
  NewTemplateSet,
  TemplateSetMember,
  NewTemplateSetMember,
  TemplateSetLike,
  TemplateSetContentType,
  Template,
} from '../schema';

export interface TemplateSetFilters {
  userId?: string;
  isPublic?: boolean;
  isCurated?: boolean;
  contentType?: TemplateSetContentType;
  search?: string;
  category?: 'all' | 'my_sets' | 'curated' | 'popular';
}

export interface TemplateSetPagination {
  page?: number;
  limit?: number;
}

export type SortOption = 'popular' | 'trending' | 'new' | 'recent';

export interface TemplateSetListResult {
  sets: TemplateSet[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TemplateSetWithMembers extends TemplateSet {
  members: Array<TemplateSetMember & { template: Template }>;
}

export class TemplateSetsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Create a new template set
   */
  async create(
    values: Omit<
      NewTemplateSet,
      'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'usageCount' | 'memberCount'
    >
  ): Promise<TemplateSet> {
    const [row] = await this.db
      .insert(schema.templateSets)
      .values({
        ...values,
        likesCount: 0,
        usageCount: 0,
        memberCount: 0,
      })
      .returning();

    return row;
  }

  /**
   * Find template set by ID
   */
  async findById(id: string): Promise<TemplateSet | null> {
    const result = await this.db.query.templateSets.findFirst({
      where: eq(schema.templateSets.id, id),
    });
    return result ?? null;
  }

  /**
   * Find template set by ID with members
   */
  async findByIdWithMembers(id: string): Promise<TemplateSetWithMembers | null> {
    const set = await this.findById(id);
    if (!set) return null;

    const members = await this.db.query.templateSetMembers.findMany({
      where: eq(schema.templateSetMembers.setId, id),
      orderBy: [asc(schema.templateSetMembers.orderPosition)],
      with: {
        template: true,
      },
    });

    return {
      ...set,
      members: members as Array<TemplateSetMember & { template: Template }>,
    };
  }

  /**
   * Find all template sets with filters and pagination
   */
  async findAll(
    filters: TemplateSetFilters = {},
    pagination: TemplateSetPagination = {},
    sort: SortOption = 'popular'
  ): Promise<TemplateSetListResult> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: ReturnType<typeof and>[] = [];

    // Category filters
    if (filters.category === 'my_sets' && filters.userId) {
      conditions.push(eq(schema.templateSets.userId, filters.userId));
    } else if (filters.category === 'curated') {
      conditions.push(eq(schema.templateSets.isCurated, true));
    } else if (filters.category === 'popular') {
      conditions.push(
        sql`${schema.templateSets.usageCount} >= 10`
      );
    }

    // Public visibility (unless filtering by own sets)
    if (filters.category !== 'my_sets') {
      if (filters.userId) {
        // Show public sets OR user's own sets
        conditions.push(
          or(
            eq(schema.templateSets.isPublic, true),
            eq(schema.templateSets.userId, filters.userId)
          )
        );
      } else {
        conditions.push(eq(schema.templateSets.isPublic, true));
      }
    }

    // Content type filter
    if (filters.contentType) {
      conditions.push(eq(schema.templateSets.contentType, filters.contentType));
    }

    // Search (name or description)
    if (filters.search) {
      conditions.push(
        or(
          ilike(schema.templateSets.name, `%${filters.search}%`),
          ilike(schema.templateSets.description ?? '', `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    let total = 0;
    try {
      const totalResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.templateSets)
        .where(whereClause);

      total = Number(totalResult[0]?.count ?? 0);
    } catch (error) {
      console.error('Error counting template sets:', error);
      return {
        sets: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }

    // Build order by based on sort option
    const orderBy = this.getOrderBy(sort);

    // Get sets
    let sets: TemplateSet[] = [];
    try {
      sets = await this.db.query.templateSets.findMany({
        where: whereClause,
        orderBy,
        limit,
        offset,
      });
    } catch (error) {
      console.error('Error fetching template sets:', error);
      return {
        sets: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }

    return {
      sets,
      total,
      page,
      limit,
      hasMore: offset + sets.length < total,
    };
  }

  /**
   * Get order by clause based on sort option
   */
  private getOrderBy(sort: SortOption) {
    switch (sort) {
      case 'popular':
        return [
          desc(schema.templateSets.usageCount),
          desc(schema.templateSets.likesCount),
          desc(schema.templateSets.createdAt),
        ];
      case 'trending':
        // For now, trending uses likes + recency
        // TODO: Implement materialized view for proper trending
        return [
          desc(schema.templateSets.likesCount),
          desc(schema.templateSets.createdAt),
        ];
      case 'new':
        return [desc(schema.templateSets.createdAt)];
      case 'recent':
        return [desc(schema.templateSets.updatedAt)];
      default:
        return [desc(schema.templateSets.createdAt)];
    }
  }

  /**
   * Update template set
   */
  async update(
    id: string,
    values: Partial<
      Omit<
        NewTemplateSet,
        'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'usageCount'
      >
    >
  ): Promise<TemplateSet | null> {
    const [row] = await this.db
      .update(schema.templateSets)
      .set({
        ...values,
        updatedAt: new Date(),
      })
      .where(eq(schema.templateSets.id, id))
      .returning();

    return row ?? null;
  }

  /**
   * Delete template set
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.templateSets)
      .where(eq(schema.templateSets.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Add member to set
   */
  async addMember(
    setId: string,
    templateId: string,
    orderPosition?: number
  ): Promise<TemplateSetMember> {
    // Get current max order position if not provided
    let position = orderPosition;
    if (position === undefined) {
      const maxResult = await this.db
        .select({ max: sql<number>`COALESCE(MAX(order_position), -1) + 1` })
        .from(schema.templateSetMembers)
        .where(eq(schema.templateSetMembers.setId, setId));
      position = maxResult[0]?.max ?? 0;
    }

    const [row] = await this.db
      .insert(schema.templateSetMembers)
      .values({
        setId,
        templateId,
        orderPosition: position,
      })
      .returning();

    // Update member count
    await this.updateMemberCount(setId);

    return row;
  }

  /**
   * Remove member from set
   */
  async removeMember(setId: string, templateId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.templateSetMembers)
      .where(
        and(
          eq(schema.templateSetMembers.setId, setId),
          eq(schema.templateSetMembers.templateId, templateId)
        )
      );

    // Update member count
    await this.updateMemberCount(setId);

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Reorder members in set
   */
  async reorderMembers(
    setId: string,
    templateIds: string[]
  ): Promise<TemplateSetMember[]> {
    // Update order positions based on array order
    const updates = templateIds.map((templateId, index) =>
      this.db
        .update(schema.templateSetMembers)
        .set({ orderPosition: index })
        .where(
          and(
            eq(schema.templateSetMembers.setId, setId),
            eq(schema.templateSetMembers.templateId, templateId)
          )
        )
    );

    await Promise.all(updates);

    // Return updated members
    return this.db.query.templateSetMembers.findMany({
      where: eq(schema.templateSetMembers.setId, setId),
      orderBy: [asc(schema.templateSetMembers.orderPosition)],
    });
  }

  /**
   * Set members (replaces all existing members)
   */
  async setMembers(
    setId: string,
    templateIds: string[]
  ): Promise<TemplateSetMember[]> {
    // Delete existing members
    await this.db
      .delete(schema.templateSetMembers)
      .where(eq(schema.templateSetMembers.setId, setId));

    // Insert new members
    if (templateIds.length > 0) {
      const newMembers = templateIds.map((templateId, index) => ({
        setId,
        templateId,
        orderPosition: index,
      }));

      await this.db.insert(schema.templateSetMembers).values(newMembers);
    }

    // Update member count
    await this.updateMemberCount(setId);

    // Return updated members
    return this.db.query.templateSetMembers.findMany({
      where: eq(schema.templateSetMembers.setId, setId),
      orderBy: [asc(schema.templateSetMembers.orderPosition)],
    });
  }

  /**
   * Update member count on set
   */
  private async updateMemberCount(setId: string): Promise<void> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.templateSetMembers)
      .where(eq(schema.templateSetMembers.setId, setId));

    const count = Number(countResult[0]?.count ?? 0);

    await this.db
      .update(schema.templateSets)
      .set({ memberCount: count, updatedAt: new Date() })
      .where(eq(schema.templateSets.id, setId));
  }

  /**
   * Increment usage count
   */
  async incrementUsageCount(id: string): Promise<void> {
    await this.db
      .update(schema.templateSets)
      .set({
        usageCount: sql`${schema.templateSets.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.templateSets.id, id));
  }

  // ==================== LIKES ====================

  /**
   * Add like to set
   */
  async addLike(setId: string, userId: string): Promise<TemplateSetLike | null> {
    try {
      const [row] = await this.db
        .insert(schema.templateSetLikes)
        .values({ setId, userId })
        .returning();

      // Increment likes count
      await this.db
        .update(schema.templateSets)
        .set({
          likesCount: sql`${schema.templateSets.likesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.templateSets.id, setId));

      return row;
    } catch (error) {
      // Unique constraint violation - user already liked
      console.error('Error adding like (may already exist):', error);
      return null;
    }
  }

  /**
   * Remove like from set
   */
  async removeLike(setId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.templateSetLikes)
      .where(
        and(
          eq(schema.templateSetLikes.setId, setId),
          eq(schema.templateSetLikes.userId, userId)
        )
      );

    if ((result.rowCount ?? 0) > 0) {
      // Decrement likes count
      await this.db
        .update(schema.templateSets)
        .set({
          likesCount: sql`GREATEST(${schema.templateSets.likesCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(schema.templateSets.id, setId));
      return true;
    }

    return false;
  }

  /**
   * Check if user has liked a set
   */
  async hasUserLiked(setId: string, userId: string): Promise<boolean> {
    const result = await this.db.query.templateSetLikes.findFirst({
      where: and(
        eq(schema.templateSetLikes.setId, setId),
        eq(schema.templateSetLikes.userId, userId)
      ),
    });
    return result !== undefined && result !== null;
  }

  /**
   * Get user's liked set IDs
   */
  async getUserLikedSetIds(userId: string): Promise<string[]> {
    const likes = await this.db.query.templateSetLikes.findMany({
      where: eq(schema.templateSetLikes.userId, userId),
      columns: { setId: true },
    });
    return likes.map((l) => l.setId);
  }
}
