import type { StudioImage } from '../../../components/studio/studio-image-card';

/**
 * Create a safe copy of an image without circular references
 * This prevents errors when selecting generating/failed images
 */
export function createSafeImageCopy(image: StudioImage): StudioImage {
  return {
    id: image.id,
    imageUrl: image.imageUrl || '',
    thumbnailUrl: image.thumbnailUrl,
    influencerId: image.influencerId,
    influencerName: image.influencerName,
    influencerAvatar: image.influencerAvatar,
    prompt: image.prompt,
    scene: image.scene,
    environment: image.environment,
    outfit: image.outfit,
    poseId: image.poseId,
    aspectRatio: image.aspectRatio,
    status: image.status,
    createdAt: image.createdAt,
    isLiked: image.isLiked,
    nsfw: image.nsfw,
    promptEnhance: image.promptEnhance,
    originalPrompt: image.originalPrompt,
    enhancedPrompt: image.enhancedPrompt,
  };
}

