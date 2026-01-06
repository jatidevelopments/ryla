import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { AspectRatio } from '../../../lib/api/studio';

interface CreatePlaceholderImagesOptions {
  jobs: Array<{ jobId: string; promptId: string }>;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string | null;
  aspectRatio: AspectRatio;
  prompt?: string;
  scene?: string;
  environment?: string;
  outfit?: string;
  nsfw?: boolean;
  promptEnhance?: boolean;
  originalPrompt?: string;
  enhancedPrompt?: string;
}

/**
 * Create placeholder StudioImage objects from generation job results
 * Used for optimistic UI updates while images are generating
 */
export function createPlaceholderImages({
  jobs,
  influencerId,
  influencerName,
  influencerAvatar,
  aspectRatio,
  prompt,
  scene = 'candid-lifestyle',
  environment = 'studio',
  outfit,
  nsfw = false,
  promptEnhance,
  originalPrompt,
  enhancedPrompt,
}: CreatePlaceholderImagesOptions): StudioImage[] {
  return jobs.map((job) => ({
    id: `placeholder-${job.promptId}`,
    imageUrl: '',
    influencerId,
    influencerName: influencerName || 'Unknown',
    influencerAvatar: influencerAvatar || undefined,
    prompt,
    scene,
    environment,
    outfit,
    aspectRatio,
    status: 'generating' as const,
    createdAt: new Date().toISOString(),
    isLiked: false,
    nsfw,
    promptEnhance,
    originalPrompt,
    enhancedPrompt,
  }));
}

