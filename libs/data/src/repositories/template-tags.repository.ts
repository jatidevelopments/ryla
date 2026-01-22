/**
 * Template Tags Repository
 *
 * Manages tag CRUD operations and template-tag assignments.
 * Epic: EP-048 (Category & Tag System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import { and, desc, eq, ilike, sql, inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import type {
  TemplateTag,
  NewTemplateTag,
  TemplateTagAssignment,
} from '../schema';

export interface TagFilters {
  search?: string;
  isSystem?: boolean;
}

export interface TagPagination {
  page?: number;
  limit?: number;
}

export interface TagListResult {
  tags: TemplateTag[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Create URL-safe slug from tag name
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export class TemplateTagsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Create a new tag
   */
  async create(
    values: Omit<NewTemplateTag, 'id' | 'createdAt' | 'usageCount' | 'slug'> & {
      slug?: string;
    }
  ): Promise<TemplateTag> {
    const slug = values.slug || slugify(values.name);

    const [row] = await this.db
      .insert(schema.templateTags)
      .values({
        ...values,
        slug,
        usageCount: 0,
      })
      .returning();

    return row;
  }

  /**
   * Find tag by ID
   */
  async findById(id: string): Promise<TemplateTag | null> {
    const result = await this.db.query.templateTags.findFirst({
      where: eq(schema.templateTags.id, id),
    });
    return result ?? null;
  }

  /**
   * Find tag by name (case-insensitive)
   */
  async findByName(name: string): Promise<TemplateTag | null> {
    const result = await this.db.query.templateTags.findFirst({
      where: ilike(schema.templateTags.name, name),
    });
    return result ?? null;
  }

  /**
   * Find tag by slug
   */
  async findBySlug(slug: string): Promise<TemplateTag | null> {
    const result = await this.db.query.templateTags.findFirst({
      where: eq(schema.templateTags.slug, slug),
    });
    return result ?? null;
  }

  /**
   * Find or create tag by name
   */
  async findOrCreate(
    name: string,
    isSystem = false
  ): Promise<{ tag: TemplateTag; created: boolean }> {
    // Try to find existing tag
    const existing = await this.findByName(name);
    if (existing) {
      return { tag: existing, created: false };
    }

    // Create new tag
    const tag = await this.create({ name: name.trim(), isSystem });
    return { tag, created: true };
  }

  /**
   * Find all tags with filters and pagination
   */
  async findAll(
    filters: TagFilters = {},
    pagination: TagPagination = {}
  ): Promise<TagListResult> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 50, 200);
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions: ReturnType<typeof and>[] = [];

    if (filters.search) {
      conditions.push(ilike(schema.templateTags.name, `%${filters.search}%`));
    }

    if (filters.isSystem !== undefined) {
      conditions.push(eq(schema.templateTags.isSystem, filters.isSystem));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total
    const totalResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.templateTags)
      .where(whereClause);

    const total = Number(totalResult[0]?.count ?? 0);

    // Get tags
    const tags = await this.db.query.templateTags.findMany({
      where: whereClause,
      orderBy: [desc(schema.templateTags.usageCount)],
      limit,
      offset,
    });

    return {
      tags,
      total,
      page,
      limit,
      hasMore: offset + tags.length < total,
    };
  }

  /**
   * Get popular tags (by usage count)
   */
  async getPopular(limit = 20): Promise<TemplateTag[]> {
    return this.db.query.templateTags.findMany({
      orderBy: [desc(schema.templateTags.usageCount)],
      limit,
    });
  }

  /**
   * Update tag
   */
  async update(
    id: string,
    values: Partial<Omit<NewTemplateTag, 'id' | 'createdAt'>>
  ): Promise<TemplateTag | null> {
    const [row] = await this.db
      .update(schema.templateTags)
      .set(values)
      .where(eq(schema.templateTags.id, id))
      .returning();

    return row ?? null;
  }

  /**
   * Delete tag
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.templateTags)
      .where(eq(schema.templateTags.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Increment usage count
   */
  async incrementUsage(id: string): Promise<void> {
    await this.db
      .update(schema.templateTags)
      .set({
        usageCount: sql`${schema.templateTags.usageCount} + 1`,
      })
      .where(eq(schema.templateTags.id, id));
  }

  /**
   * Decrement usage count
   */
  async decrementUsage(id: string): Promise<void> {
    await this.db
      .update(schema.templateTags)
      .set({
        usageCount: sql`GREATEST(${schema.templateTags.usageCount} - 1, 0)`,
      })
      .where(eq(schema.templateTags.id, id));
  }

  // ==================== ASSIGNMENTS ====================

  /**
   * Assign tag to template
   */
  async assignToTemplate(
    templateId: string,
    tagId: string
  ): Promise<TemplateTagAssignment | null> {
    try {
      const [row] = await this.db
        .insert(schema.templateTagAssignments)
        .values({ templateId, tagId })
        .returning();

      // Increment usage
      await this.incrementUsage(tagId);

      return row;
    } catch {
      // Already assigned
      return null;
    }
  }

  /**
   * Remove tag from template
   */
  async removeFromTemplate(templateId: string, tagId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.templateTagAssignments)
      .where(
        and(
          eq(schema.templateTagAssignments.templateId, templateId),
          eq(schema.templateTagAssignments.tagId, tagId)
        )
      );

    if ((result.rowCount ?? 0) > 0) {
      // Decrement usage
      await this.decrementUsage(tagId);
      return true;
    }

    return false;
  }

  /**
   * Get tags for a template
   */
  async findByTemplateId(templateId: string): Promise<TemplateTag[]> {
    const assignments = await this.db.query.templateTagAssignments.findMany({
      where: eq(schema.templateTagAssignments.templateId, templateId),
      with: {
        tag: true,
      },
    });

    return assignments.map((a) => a.tag);
  }

  /**
   * Get template IDs that have a specific tag
   */
  async findTemplateIdsByTagId(tagId: string): Promise<string[]> {
    const assignments = await this.db.query.templateTagAssignments.findMany({
      where: eq(schema.templateTagAssignments.tagId, tagId),
      columns: { templateId: true },
    });

    return assignments.map((a) => a.templateId);
  }

  /**
   * Get template IDs that have any of the specified tags
   */
  async findTemplateIdsByTagIds(tagIds: string[]): Promise<string[]> {
    if (tagIds.length === 0) return [];

    const assignments = await this.db.query.templateTagAssignments.findMany({
      where: inArray(schema.templateTagAssignments.tagId, tagIds),
      columns: { templateId: true },
    });

    // Return unique template IDs
    return [...new Set(assignments.map((a) => a.templateId))];
  }

  /**
   * Set tags for template (replaces all existing)
   */
  async setTemplateTags(
    templateId: string,
    tagIds: string[]
  ): Promise<TemplateTag[]> {
    // Get current tags to adjust usage counts
    const currentTags = await this.findByTemplateId(templateId);
    const currentTagIds = new Set(currentTags.map((t) => t.id));
    const newTagIds = new Set(tagIds);

    // Tags to remove
    const toRemove = currentTags.filter((t) => !newTagIds.has(t.id));
    for (const tag of toRemove) {
      await this.removeFromTemplate(templateId, tag.id);
    }

    // Tags to add
    const toAdd = tagIds.filter((id) => !currentTagIds.has(id));
    for (const tagId of toAdd) {
      await this.assignToTemplate(templateId, tagId);
    }

    // Return updated tags
    return this.findByTemplateId(templateId);
  }
}
