/**
 * Template Categories Repository
 *
 * Manages category CRUD operations and tree traversal.
 * Epic: EP-048 (Category & Tag System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import type { TemplateCategory, NewTemplateCategory } from '../schema';

export interface TemplateCategoryTree extends TemplateCategory {
  children: TemplateCategoryTree[];
}

export class TemplateCategoriesRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Create a new category
   */
  async create(
    values: Omit<NewTemplateCategory, 'id' | 'createdAt'>
  ): Promise<TemplateCategory> {
    const [row] = await this.db
      .insert(schema.templateCategories)
      .values(values)
      .returning();

    return row;
  }

  /**
   * Find category by ID
   */
  async findById(id: string): Promise<TemplateCategory | null> {
    const result = await this.db.query.templateCategories.findFirst({
      where: eq(schema.templateCategories.id, id),
    });
    return result ?? null;
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string): Promise<TemplateCategory | null> {
    const result = await this.db.query.templateCategories.findFirst({
      where: eq(schema.templateCategories.slug, slug),
    });
    return result ?? null;
  }

  /**
   * Find all categories (flat list)
   */
  async findAll(activeOnly = true): Promise<TemplateCategory[]> {
    const conditions = activeOnly
      ? eq(schema.templateCategories.isActive, true)
      : undefined;

    return this.db.query.templateCategories.findMany({
      where: conditions,
      orderBy: [
        asc(schema.templateCategories.sortOrder),
        asc(schema.templateCategories.name),
      ],
    });
  }

  /**
   * Find root categories (no parent)
   */
  async findRoots(activeOnly = true): Promise<TemplateCategory[]> {
    const conditions = activeOnly
      ? and(
          isNull(schema.templateCategories.parentId),
          eq(schema.templateCategories.isActive, true)
        )
      : isNull(schema.templateCategories.parentId);

    return this.db.query.templateCategories.findMany({
      where: conditions,
      orderBy: [
        asc(schema.templateCategories.sortOrder),
        asc(schema.templateCategories.name),
      ],
    });
  }

  /**
   * Get direct children of a category
   */
  async getChildren(
    parentId: string,
    activeOnly = true
  ): Promise<TemplateCategory[]> {
    const conditions = activeOnly
      ? and(
          eq(schema.templateCategories.parentId, parentId),
          eq(schema.templateCategories.isActive, true)
        )
      : eq(schema.templateCategories.parentId, parentId);

    return this.db.query.templateCategories.findMany({
      where: conditions,
      orderBy: [
        asc(schema.templateCategories.sortOrder),
        asc(schema.templateCategories.name),
      ],
    });
  }

  /**
   * Get path to root (ancestors)
   */
  async getAncestors(categoryId: string): Promise<TemplateCategory[]> {
    const ancestors: TemplateCategory[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category = await this.findById(currentId);
      if (!category) break;

      if (category.id !== categoryId) {
        ancestors.unshift(category); // Add to beginning for root-to-leaf order
      }
      currentId = category.parentId;
    }

    return ancestors;
  }

  /**
   * Build category tree from flat list
   */
  async findTree(activeOnly = true): Promise<TemplateCategoryTree[]> {
    const allCategories = await this.findAll(activeOnly);
    return this.buildTree(allCategories, null);
  }

  /**
   * Build tree structure from flat list
   */
  private buildTree(
    categories: TemplateCategory[],
    parentId: string | null
  ): TemplateCategoryTree[] {
    return categories
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((category) => ({
        ...category,
        children: this.buildTree(categories, category.id),
      }));
  }

  /**
   * Update category
   */
  async update(
    id: string,
    values: Partial<Omit<NewTemplateCategory, 'id' | 'createdAt'>>
  ): Promise<TemplateCategory | null> {
    const [row] = await this.db
      .update(schema.templateCategories)
      .set(values)
      .where(eq(schema.templateCategories.id, id))
      .returning();

    return row ?? null;
  }

  /**
   * Delete category (cascades to children)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.templateCategories)
      .where(eq(schema.templateCategories.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Count templates in category
   */
  async countTemplates(categoryId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.templates)
      .where(eq(schema.templates.categoryId, categoryId));

    return Number(result[0]?.count ?? 0);
  }

  /**
   * Get all descendant IDs (for filtering)
   */
  async getDescendantIds(categoryId: string): Promise<string[]> {
    const descendants: string[] = [categoryId];
    const children = await this.getChildren(categoryId, true);

    for (const child of children) {
      const childDescendants = await this.getDescendantIds(child.id);
      descendants.push(...childDescendants);
    }

    return descendants;
  }
}
