/**
 * Post Prompt Tracking Service
 *
 * Tracks prompt usage when posts are created.
 * Integrates with PromptsService to record analytics.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PromptsRepository } from '@ryla/data/repositories';
import type { Post } from '@ryla/data/schema';

export interface PostCreationData {
  postId: string;
  userId: string;
  characterId: string;
  jobId?: string;
  promptId?: string; // ID of the prompt template used
  scene?: string;
  environment?: string;
  outfit?: string;
  prompt?: string; // Full prompt text used
  negativePrompt?: string;
  success: boolean;
  generationTimeMs?: number;
  errorMessage?: string;
}

export class PostPromptTrackingService {
  private promptsRepository: PromptsRepository;

  constructor(db: NodePgDatabase<any>) {
    this.promptsRepository = new PromptsRepository(db);
  }

  /**
   * Track prompt usage when a post is created
   * Should be called after successfully creating a post in the database
   */
  async trackPostCreation(data: PostCreationData): Promise<void> {
    // Only track if promptId is provided
    if (!data.promptId) {
      return; // No prompt template used, skip tracking
    }

    try {
      await this.promptsRepository.trackUsage({
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
    } catch (error) {
      // Log error but don't fail post creation
      console.error('Failed to track prompt usage:', error);
    }
  }

  /**
   * Track prompt usage from a Post object
   * Convenience method that extracts data from Post
   */
  async trackFromPost(
    post: Post,
    options: {
      success: boolean;
      generationTimeMs?: number;
      errorMessage?: string;
    }
  ): Promise<void> {
    // Extract promptId from post if available
    // Note: posts table needs promptId field (added in schema)
    const promptId = (post as any).promptId;

    if (!promptId) {
      return; // No prompt template used
    }

    await this.trackPostCreation({
      postId: post.id,
      userId: post.userId,
      characterId: post.characterId,
      jobId: post.jobId || undefined,
      promptId,
      scene: post.scene,
      environment: post.environment,
      outfit: post.outfit,
      prompt: post.prompt || undefined,
      negativePrompt: post.negativePrompt || undefined,
      success: options.success,
      generationTimeMs: options.generationTimeMs,
      errorMessage: options.errorMessage,
    });
  }
}

