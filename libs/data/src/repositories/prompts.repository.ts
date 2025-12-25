import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, or, desc, asc, sql, isNull, isNotNull } from 'drizzle-orm';

import * as schema from '../schema';
import type {
  Prompt,
  NewPrompt,
  PromptUsage,
  NewPromptUsage,
  PromptFavorite,
  NewPromptFavorite,
} from '../schema/prompts.schema';

export type { Prompt, NewPrompt, PromptUsage, NewPromptUsage, PromptFavorite };

export class PromptsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  // ==========================================
  // PROMPT CRUD
  // ==========================================

  /**
   * Create a new prompt
   */
  async create(
    values: Omit<NewPrompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'successCount' | 'favoriteCount'>
  ): Promise<Prompt> {
    const [row] = await this.db
      .insert(schema.prompts)
      .values({
        ...values,
        usageCount: 0,
        successCount: 0,
        favoriteCount: 0,
      })
      .returning();

    return row;
  }

  /**
   * Find prompt by ID
   */
  async findById(id: string): Promise<Prompt | undefined> {
    return this.db.query.prompts.findFirst({
      where: eq(schema.prompts.id, id),
    });
  }

  /**
   * Find all prompts with optional filters
   * Returns favorites first if userId provided
   */
  async findAll(options: {
    userId?: string; // If provided, favorites appear first
    category?: string;
    rating?: 'sfw' | 'suggestive' | 'nsfw';
    isActive?: boolean;
    isPublic?: boolean;
    search?: string; // Search in name, description, tags
    limit?: number;
    offset?: number;
  }): Promise<Prompt[]> {
    const { userId, category, rating, isActive, isPublic, search, limit, offset } = options;

    let query = this.db.select().from(schema.prompts);

    // Build where conditions
    const conditions = [];
    if (category) {
      conditions.push(eq(schema.prompts.category, category as any));
    }
    if (rating) {
      conditions.push(eq(schema.prompts.rating, rating));
    }
    if (isActive !== undefined) {
      conditions.push(eq(schema.prompts.isActive, isActive));
    }
    if (isPublic !== undefined) {
      conditions.push(eq(schema.prompts.isPublic, isPublic));
    }
    if (search) {
      conditions.push(
        or(
          sql`${schema.prompts.name} ILIKE ${'%' + search + '%'}`,
          sql`${schema.prompts.description} ILIKE ${'%' + search + '%'}`,
          sql`${schema.prompts.tags}::text ILIKE ${'%' + search + '%'}`
        )!
      );
    }
    // Only show non-deleted prompts
    conditions.push(isNull(schema.prompts.deletedAt));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // If userId provided, join with favorites and order favorites first
    if (userId) {
      query = query
        .leftJoin(
          schema.promptFavorites,
          and(
            eq(schema.promptFavorites.promptId, schema.prompts.id),
            eq(schema.promptFavorites.userId, userId)
          )
        )
        .orderBy(
          desc(schema.promptFavorites.id), // Favorites first (not null = favorited)
          desc(schema.prompts.usageCount), // Then by usage
          desc(schema.prompts.favoriteCount) // Then by total favorites
        ) as any;
    } else {
      query = query
        .orderBy(
          desc(schema.prompts.usageCount),
          desc(schema.prompts.favoriteCount)
        ) as any;
    }

    if (limit) {
      query = query.limit(limit) as any;
    }
    if (offset) {
      query = query.offset(offset) as any;
    }

    const results = await query;
    // Extract prompts from join results
    return results.map((row: any) => row.prompts || row) as Prompt[];
  }

  /**
   * Get user's favorite prompts (ordered by sortOrder)
   */
  async findFavorites(userId: string): Promise<Prompt[]> {
    const results = await this.db
      .select({
        prompt: schema.prompts,
        favorite: schema.promptFavorites,
      })
      .from(schema.promptFavorites)
      .innerJoin(schema.prompts, eq(schema.promptFavorites.promptId, schema.prompts.id))
      .where(
        and(
          eq(schema.promptFavorites.userId, userId),
          isNull(schema.prompts.deletedAt),
          eq(schema.prompts.isActive, true)
        )
      )
      .orderBy(asc(schema.promptFavorites.sortOrder), desc(schema.promptFavorites.createdAt));

    return results.map((r) => r.prompt);
  }

  /**
   * Update prompt by ID
   */
  async updateById(
    id: string,
    patch: Partial<Omit<NewPrompt, 'id' | 'createdAt'>>
  ): Promise<Prompt | undefined> {
    const [row] = await this.db
      .update(schema.prompts)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.prompts.id, id))
      .returning();

    return row;
  }

  /**
   * Increment usage stats
   */
  async incrementUsage(id: string, success: boolean): Promise<void> {
    await this.db
      .update(schema.prompts)
      .set({
        usageCount: sql`${schema.prompts.usageCount} + 1`,
        successCount: success
          ? sql`${schema.prompts.successCount} + 1`
          : schema.prompts.successCount,
        updatedAt: new Date(),
      })
      .where(eq(schema.prompts.id, id));
  }

  /**
   * Soft delete prompt
   */
  async deleteById(id: string): Promise<boolean> {
    const result = await this.db
      .update(schema.prompts)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.prompts.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  // ==========================================
  // PROMPT USAGE TRACKING
  // ==========================================

  /**
   * Track prompt usage for analytics
   */
  async trackUsage(values: Omit<NewPromptUsage, 'id' | 'createdAt'>): Promise<PromptUsage> {
    const [row] = await this.db
      .insert(schema.promptUsage)
      .values(values)
      .returning();

    // Update aggregated stats on prompt
    await this.incrementUsage(values.promptId, values.success ?? false);

    return row;
  }

  /**
   * Get usage stats for a prompt
   */
  async getUsageStats(promptId: string): Promise<{
    totalUsage: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    avgGenerationTimeMs: number | null;
    lastUsedAt: Date | null;
  }> {
    const stats = await this.db
      .select({
        totalUsage: sql<number>`COUNT(*)::int`,
        successCount: sql<number>`COUNT(*) FILTER (WHERE ${schema.promptUsage.success} = true)::int`,
        failureCount: sql<number>`COUNT(*) FILTER (WHERE ${schema.promptUsage.success} = false)::int`,
        avgGenerationTimeMs: sql<number | null>`AVG(${schema.promptUsage.generationTimeMs})::int`,
        lastUsedAt: sql<Date | null>`MAX(${schema.promptUsage.createdAt})`,
      })
      .from(schema.promptUsage)
      .where(eq(schema.promptUsage.promptId, promptId));

    const result = stats[0];
    if (!result) {
      return {
        totalUsage: 0,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        avgGenerationTimeMs: null,
        lastUsedAt: null,
      };
    }

    return {
      totalUsage: result.totalUsage,
      successCount: result.successCount,
      failureCount: result.failureCount,
      successRate:
        result.totalUsage > 0
          ? (result.successCount / result.totalUsage) * 100
          : 0,
      avgGenerationTimeMs: result.avgGenerationTimeMs,
      lastUsedAt: result.lastUsedAt,
    };
  }

  /**
   * Get top used prompts
   */
  async getTopUsed(limit: number = 10): Promise<Prompt[]> {
    return this.db.query.prompts.findMany({
      where: and(
        isNull(schema.prompts.deletedAt),
        eq(schema.prompts.isActive, true)
      ),
      orderBy: [desc(schema.prompts.usageCount), desc(schema.prompts.successCount)],
      limit,
    });
  }

  // ==========================================
  // FAVORITES
  // ==========================================

  /**
   * Add prompt to favorites
   */
  async addFavorite(
    userId: string,
    promptId: string,
    sortOrder?: number
  ): Promise<PromptFavorite> {
    // Check if already favorited
    const existing = await this.db.query.promptFavorites.findFirst({
      where: and(
        eq(schema.promptFavorites.userId, userId),
        eq(schema.promptFavorites.promptId, promptId)
      ),
    });

    if (existing) {
      // Update sort order if provided
      if (sortOrder !== undefined) {
        const [updated] = await this.db
          .update(schema.promptFavorites)
          .set({ sortOrder })
          .where(eq(schema.promptFavorites.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }

    // Get next sort order if not provided
    if (sortOrder === undefined) {
      const maxOrder = await this.db
        .select({ max: sql<number>`MAX(${schema.promptFavorites.sortOrder})::int` })
        .from(schema.promptFavorites)
        .where(eq(schema.promptFavorites.userId, userId));

      sortOrder = (maxOrder[0]?.max ?? -1) + 1;
    }

    const [row] = await this.db
      .insert(schema.promptFavorites)
      .values({
        userId,
        promptId,
        sortOrder,
      })
      .returning();

    // Update favorite count on prompt
    await this.db
      .update(schema.prompts)
      .set({
        favoriteCount: sql`${schema.prompts.favoriteCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.prompts.id, promptId));

    return row;
  }

  /**
   * Remove prompt from favorites
   */
  async removeFavorite(userId: string, promptId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.promptFavorites)
      .where(
        and(
          eq(schema.promptFavorites.userId, userId),
          eq(schema.promptFavorites.promptId, promptId)
        )
      );

    if ((result.rowCount ?? 0) > 0) {
      // Update favorite count on prompt
      await this.db
        .update(schema.prompts)
        .set({
          favoriteCount: sql`GREATEST(${schema.prompts.favoriteCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(schema.prompts.id, promptId));

      return true;
    }

    return false;
  }

  /**
   * Check if prompt is favorited by user
   */
  async isFavorited(userId: string, promptId: string): Promise<boolean> {
    const favorite = await this.db.query.promptFavorites.findFirst({
      where: and(
        eq(schema.promptFavorites.userId, userId),
        eq(schema.promptFavorites.promptId, promptId)
      ),
    });

    return !!favorite;
  }

  /**
   * Update favorite sort order
   */
  async updateFavoriteOrder(
    userId: string,
    promptId: string,
    sortOrder: number
  ): Promise<PromptFavorite | undefined> {
    const [row] = await this.db
      .update(schema.promptFavorites)
      .set({ sortOrder })
      .where(
        and(
          eq(schema.promptFavorites.userId, userId),
          eq(schema.promptFavorites.promptId, promptId)
        )
      )
      .returning();

    return row;
  }
}

