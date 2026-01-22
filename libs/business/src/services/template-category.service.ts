/**
 * Template Category Service
 *
 * Business logic for category management and tree operations.
 * Epic: EP-048 (Category & Tag System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import {
  TemplateCategoriesRepository,
  type TemplateCategoryTree,
} from '@ryla/data/repositories/template-categories.repository';
import type { TemplateCategory } from '@ryla/data/schema';

export interface CreateCategoryInput {
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export class TemplateCategoryService {
  private categoriesRepo: TemplateCategoriesRepository;

  constructor(db: NodePgDatabase<typeof schema>) {
    this.categoriesRepo = new TemplateCategoriesRepository(db);
  }

  /**
   * Get all categories as a tree
   */
  async getTree(activeOnly = true): Promise<TemplateCategoryTree[]> {
    return this.categoriesRepo.findTree(activeOnly);
  }

  /**
   * Get all categories as a flat list
   */
  async getAll(activeOnly = true): Promise<TemplateCategory[]> {
    return this.categoriesRepo.findAll(activeOnly);
  }

  /**
   * Get root categories (top-level)
   */
  async getRoots(activeOnly = true): Promise<TemplateCategory[]> {
    return this.categoriesRepo.findRoots(activeOnly);
  }

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<TemplateCategory | null> {
    return this.categoriesRepo.findById(id);
  }

  /**
   * Get category by slug
   */
  async getBySlug(slug: string): Promise<TemplateCategory | null> {
    return this.categoriesRepo.findBySlug(slug);
  }

  /**
   * Get children of a category
   */
  async getChildren(
    parentId: string,
    activeOnly = true
  ): Promise<TemplateCategory[]> {
    return this.categoriesRepo.getChildren(parentId, activeOnly);
  }

  /**
   * Get ancestors (path to root)
   */
  async getAncestors(categoryId: string): Promise<TemplateCategory[]> {
    return this.categoriesRepo.getAncestors(categoryId);
  }

  /**
   * Get breadcrumb path (ancestors + current)
   */
  async getBreadcrumb(categoryId: string): Promise<TemplateCategory[]> {
    const category = await this.categoriesRepo.findById(categoryId);
    if (!category) {
      return [];
    }

    const ancestors = await this.categoriesRepo.getAncestors(categoryId);
    return [...ancestors, category];
  }

  /**
   * Get all descendant IDs (for filtering templates)
   */
  async getDescendantIds(categoryId: string): Promise<string[]> {
    return this.categoriesRepo.getDescendantIds(categoryId);
  }

  /**
   * Count templates in category
   */
  async countTemplates(categoryId: string): Promise<number> {
    return this.categoriesRepo.countTemplates(categoryId);
  }

  /**
   * Create category (admin only)
   */
  async create(input: CreateCategoryInput): Promise<TemplateCategory> {
    // Validate name
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Category name is required');
    }

    // Validate slug
    if (!input.slug || input.slug.trim().length === 0) {
      throw new Error('Category slug is required');
    }

    // Check for duplicate slug
    const existing = await this.categoriesRepo.findBySlug(input.slug);
    if (existing) {
      throw new Error(`Category with slug "${input.slug}" already exists`);
    }

    // Validate parent exists if provided
    if (input.parentId) {
      const parent = await this.categoriesRepo.findById(input.parentId);
      if (!parent) {
        throw new Error('Parent category not found');
      }
    }

    return this.categoriesRepo.create({
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase(),
      parentId: input.parentId ?? null,
      description: input.description?.trim() ?? null,
      icon: input.icon ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: true,
    });
  }

  /**
   * Update category (admin only)
   */
  async update(id: string, input: UpdateCategoryInput): Promise<TemplateCategory> {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Validate slug if changing
    if (input.slug && input.slug !== category.slug) {
      const existing = await this.categoriesRepo.findBySlug(input.slug);
      if (existing) {
        throw new Error(`Category with slug "${input.slug}" already exists`);
      }
    }

    const updated = await this.categoriesRepo.update(id, {
      name: input.name?.trim(),
      slug: input.slug?.trim().toLowerCase(),
      description: input.description?.trim(),
      icon: input.icon,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    });

    if (!updated) {
      throw new Error('Failed to update category');
    }

    return updated;
  }

  /**
   * Delete category (admin only)
   * Note: Cascades to children and removes category from templates
   */
  async delete(id: string): Promise<boolean> {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    return this.categoriesRepo.delete(id);
  }

  /**
   * Deactivate category (soft delete)
   */
  async deactivate(id: string): Promise<TemplateCategory> {
    return this.update(id, { isActive: false });
  }

  /**
   * Reactivate category
   */
  async reactivate(id: string): Promise<TemplateCategory> {
    return this.update(id, { isActive: true });
  }
}
