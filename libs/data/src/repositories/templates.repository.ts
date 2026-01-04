/**
 * Templates Repository
 *
 * Manages template CRUD operations and usage tracking.
 */

import { and, desc, eq, or, sql, inArray, ilike, gte, lte } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import type { Template, NewTemplate, TemplateUsage, NewTemplateUsage, TemplateConfig } from '../schema';

export interface TemplateFilters {
  scene?: string;
  environment?: string;
  aspectRatio?: string;
  qualityMode?: 'draft' | 'hq';
  nsfw?: boolean;
  search?: string;
  category?: 'all' | 'my_templates' | 'curated' | 'popular';
  influencerId?: string;
  userId?: string;
}

export interface TemplatePagination {
  page?: number;
  limit?: number;
}

export interface TemplateListResult {
  templates: Template[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class TemplatesRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Create a new template
   */
  async create(values: Omit<NewTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Template> {
    const [row] = await this.db
      .insert(schema.templates)
      .values({
        ...values,
        usageCount: 0,
      })
      .returning();

    return row;
  }

  /**
   * Find template by ID
   */
  async findById(id: string): Promise<Template | null> {
    return this.db.query.templates.findFirst({
      where: eq(schema.templates.id, id),
    });
  }

  /**
   * Find all templates with filters and pagination
   */
  async findAll(
    filters: TemplateFilters = {},
    pagination: TemplatePagination = {}
  ): Promise<TemplateListResult> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100); // Max 100 per page
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: ReturnType<typeof and>[] = [];

    // Category filters
    if (filters.category === 'my_templates' && filters.userId) {
      conditions.push(eq(schema.templates.userId, filters.userId));
    } else if (filters.category === 'curated') {
      conditions.push(eq(schema.templates.isCurated, true));
    } else if (filters.category === 'popular') {
      // Popular = high usage count (>= 10)
      conditions.push(gte(schema.templates.usageCount, 10));
    }

    // Public/curated visibility (unless filtering by user)
    if (filters.category !== 'my_templates' && !filters.userId) {
      conditions.push(
        or(
          eq(schema.templates.isPublic, true),
          eq(schema.templates.isCurated, true)
        )
      );
    }

    // Influencer filter
    if (filters.influencerId) {
      conditions.push(eq(schema.templates.influencerId, filters.influencerId));
    }

    // User filter (for my templates)
    if (filters.userId && filters.category === 'my_templates') {
      conditions.push(eq(schema.templates.userId, filters.userId));
    }

    // Config-based filters (using JSONB queries)
    // Note: Using raw SQL for JSONB queries as Drizzle doesn't have built-in JSONB operators
    if (filters.scene) {
      conditions.push(sql`("templates"."config"->>'scene')::text = ${filters.scene}`);
    }
    if (filters.environment) {
      conditions.push(sql`("templates"."config"->>'environment')::text = ${filters.environment}`);
    }
    if (filters.aspectRatio) {
      conditions.push(sql`("templates"."config"->>'aspectRatio')::text = ${filters.aspectRatio}`);
    }
    if (filters.qualityMode) {
      conditions.push(sql`("templates"."config"->>'qualityMode')::text = ${filters.qualityMode}`);
    }
    if (filters.nsfw !== undefined) {
      conditions.push(sql`("templates"."config"->>'nsfw')::boolean = ${filters.nsfw}`);
    }

    // Search (name or description)
    if (filters.search) {
      conditions.push(
        or(
          ilike(schema.templates.name, `%${filters.search}%`),
          ilike(schema.templates.description ?? '', `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    let total = 0;
    try {
      const totalResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.templates)
        .where(whereClause);

      total = Number(totalResult[0]?.count ?? 0);
    } catch (error) {
      // If table doesn't exist or query fails, return empty result
      console.error('Error counting templates:', error);
      return {
        templates: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }

    // Get templates
    let templates: Template[] = [];
    try {
      templates = await this.db.query.templates.findMany({
        where: whereClause,
        orderBy: [desc(schema.templates.usageCount), desc(schema.templates.createdAt)],
        limit,
        offset,
      });
    } catch (error) {
      // If table doesn't exist or query fails, return empty result
      console.error('Error fetching templates:', error);
      return {
        templates: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }

    return {
      templates,
      total,
      page,
      limit,
      hasMore: offset + templates.length < total,
    };
  }

  /**
   * Update template
   */
  async update(
    id: string,
    values: Partial<Omit<NewTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>>
  ): Promise<Template | null> {
    const [row] = await this.db
      .update(schema.templates)
      .set({
        ...values,
        updatedAt: new Date(),
      })
      .where(eq(schema.templates.id, id))
      .returning();

    return row ?? null;
  }

  /**
   * Delete template
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.templates)
      .where(eq(schema.templates.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Increment usage count for a template
   */
  async incrementUsageCount(id: string): Promise<void> {
    await this.db
      .update(schema.templates)
      .set({
        usageCount: sql`${schema.templates.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.templates.id, id));
  }

  /**
   * Track template usage
   */
  async trackUsage(
    templateId: string,
    userId: string | null,
    jobId: string | null,
    generationSuccessful: boolean | null
  ): Promise<TemplateUsage> {
    const [row] = await this.db
      .insert(schema.templateUsage)
      .values({
        templateId,
        userId,
        jobId,
        generationSuccessful,
      })
      .returning();

    return row;
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
      createdAt: Date;
    }>;
  }> {
    const template = await this.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Get recent usage (last 100)
    const recentUsage = await this.db.query.templateUsage.findMany({
      where: eq(schema.templateUsage.templateId, id),
      orderBy: [desc(schema.templateUsage.createdAt)],
      limit: 100,
    });

    // Calculate success rate
    const successfulCount = recentUsage.filter((u) => u.generationSuccessful === true).length;
    const totalWithResult = recentUsage.filter((u) => u.generationSuccessful !== null).length;
    const successRate =
      totalWithResult > 0 ? (successfulCount / totalWithResult) * 100 : null;

    return {
      usageCount: template.usageCount,
      successRate: successRate !== null ? Number(successRate.toFixed(2)) : null,
      recentUsage: recentUsage.map((u) => ({
        userId: u.userId,
        jobId: u.jobId,
        successful: u.generationSuccessful,
        createdAt: u.createdAt,
      })),
    };
  }

  /**
   * Update success rate for a template (called after usage tracking)
   */
  async updateSuccessRate(id: string): Promise<void> {
    const stats = await this.getStats(id);
    await this.update(id, {
      successRate: stats.successRate !== null ? String(stats.successRate) : null,
    });
  }
}

