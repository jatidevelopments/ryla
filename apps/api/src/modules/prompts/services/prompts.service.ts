import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PromptsRepository } from '@ryla/data/repositories';
import type { Prompt, PromptUsage } from '@ryla/data/schema';

export interface PromptListOptions {
  userId?: string;
  category?: string;
  rating?: 'sfw' | 'suggestive' | 'nsfw';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PromptStats {
  promptId: string;
  totalUsage: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgGenerationTimeMs: number | null;
  lastUsedAt: Date | null;
}

@Injectable()
export class PromptsService {
  private promptsRepository: PromptsRepository;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<any>,
  ) {
    this.promptsRepository = new PromptsRepository(this.db);
  }

  /**
   * Get all prompts (favorites first if userId provided)
   */
  async findAll(options: PromptListOptions): Promise<Prompt[]> {
    return this.promptsRepository.findAll({
      userId: options.userId,
      category: options.category,
      rating: options.rating,
      isActive: true,
      isPublic: true,
      search: options.search,
      limit: options.limit,
      offset: options.offset,
    });
  }

  /**
   * Get prompt by ID
   */
  async findById(id: string): Promise<Prompt> {
    const prompt = await this.promptsRepository.findById(id);
    if (!prompt) {
      throw new NotFoundException(`Prompt with ID ${id} not found`);
    }
    return prompt;
  }

  /**
   * Get user's favorite prompts
   */
  async findFavorites(userId: string): Promise<Prompt[]> {
    return this.promptsRepository.findFavorites(userId);
  }

  /**
   * Add prompt to favorites
   */
  async addFavorite(userId: string, promptId: string): Promise<{ favorited: boolean }> {
    await this.findById(promptId); // Verify prompt exists
    await this.promptsRepository.addFavorite(userId, promptId);
    return { favorited: true };
  }

  /**
   * Remove prompt from favorites
   */
  async removeFavorite(userId: string, promptId: string): Promise<{ favorited: boolean }> {
    const removed = await this.promptsRepository.removeFavorite(userId, promptId);
    return { favorited: !removed };
  }

  /**
   * Check if prompt is favorited
   */
  async isFavorited(userId: string, promptId: string): Promise<{ favorited: boolean }> {
    const favorited = await this.promptsRepository.isFavorited(userId, promptId);
    return { favorited };
  }

  /**
   * Get usage stats for a prompt
   */
  async getUsageStats(promptId: string): Promise<PromptStats> {
    await this.findById(promptId); // Verify prompt exists
    const stats = await this.promptsRepository.getUsageStats(promptId);
    return {
      promptId,
      ...stats,
    };
  }

  /**
   * Get top used prompts
   */
  async getTopUsed(limit: number = 10): Promise<Prompt[]> {
    return this.promptsRepository.getTopUsed(limit);
  }

  /**
   * Track prompt usage (called when a post is generated)
   */
  async trackUsage(data: {
    promptId: string;
    userId: string;
    characterId?: string;
    postId?: string;
    jobId?: string;
    scene?: string;
    environment?: string;
    outfit?: string;
    success: boolean;
    generationTimeMs?: number;
    errorMessage?: string;
  }): Promise<PromptUsage> {
    return this.promptsRepository.trackUsage({
      promptId: data.promptId,
      userId: data.userId,
      characterId: data.characterId,
      postId: data.postId,
      jobId: data.jobId,
      scene: data.scene,
      environment: data.environment,
      outfit: data.outfit,
      success: data.success,
      generationTimeMs: data.generationTimeMs,
      errorMessage: data.errorMessage,
    });
  }

  /**
   * Create a new prompt (for user-created prompts)
   */
  async create(data: {
    userId: string;
    name: string;
    description?: string;
    category: string;
    subcategory?: string;
    template: string;
    negativePrompt?: string;
    requiredDNA?: string[];
    tags?: string[];
    rating: 'sfw' | 'suggestive' | 'nsfw';
    recommendedWorkflow?: string;
    aspectRatio?: string;
    isPublic?: boolean;
  }): Promise<Prompt> {
    return this.promptsRepository.create({
      createdBy: data.userId,
      name: data.name,
      description: data.description,
      category: data.category as any,
      subcategory: data.subcategory,
      template: data.template,
      negativePrompt: data.negativePrompt,
      requiredDNA: data.requiredDNA || [],
      tags: data.tags || [],
      rating: data.rating,
      recommendedWorkflow: data.recommendedWorkflow,
      aspectRatio: data.aspectRatio as any,
      isSystemPrompt: false,
      isPublic: data.isPublic ?? false,
      isActive: true,
    });
  }
}

