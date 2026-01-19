/**
 * Studio API client
 * - Generate Studio images (image assets)
 * - Inpaint edit (masked RGBA PNG)
 * - Poll ComfyUI results (persists to DB-backed images)
 */

import { authFetch } from '../auth';
import { OutfitComposition, AspectRatio } from '@ryla/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type { AspectRatio } from '@ryla/shared';
export type QualityMode = 'draft' | 'hq';

export interface GenerateStudioImagesInput {
  characterId: string;
  additionalDetails?: string; // Optional additional details to add to prompt
  scene: string; // kebab-case in web, mapped to snake_case for API
  environment: string; // kebab-case in web, mapped to snake_case for API
  outfit: string | OutfitComposition; // Supports both legacy string and new composition
  poseId?: string; // Pose ID (e.g., "standing-casual", "sitting-elegant")
  lighting?: string; // Lighting preset (e.g., "natural.goldenHour")
  expression?: string; // Expression preset (e.g., "positive.smile")
  aspectRatio: AspectRatio;
  qualityMode: QualityMode;
  count: number;
  nsfw: boolean;
  promptEnhance?: boolean; // Enable AI prompt enhancement (uses OpenRouter/Gemini/OpenAI)
  seed?: number;
  modelProvider?: 'comfyui' | 'fal';
  modelId?: string;
  isRetry?: boolean; // Indicates this is a retry of a failed image (should not charge credits)
  retryImageId?: string; // ID of the failed image being retried
}

export interface InpaintEditInput {
  characterId: string;
  sourceImageId: string;
  prompt: string;
  negativePrompt?: string;
  maskedImageBase64Png: string; // data:image/png;base64,...
  seed?: number;
}

export interface ComfyUIResultImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  s3Key?: string;
}

export interface ComfyUIJobResult {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  images: ComfyUIResultImage[];
  error?: string;
  // Timestamp when job started processing (for progress estimation)
  startedAt?: string;
}

function presetToSnakeCase(value: string): string {
  // Shared constants use kebab-case; DB enums are snake_case.
  if (value === 'cozy-at-home') return 'cozy_home';
  return value.replace(/-/g, '_');
}

export async function generateStudioImages(
  input: GenerateStudioImagesInput
): Promise<{
  workflowId: string;
  jobs: Array<{ jobId: string; promptId: string }>;
}> {
  // Send outfit as-is (backend will handle both string and object)
  const outfitPayload =
    typeof input.outfit === 'string' ? input.outfit : input.outfit; // Send object directly, backend will handle it

  const response = await authFetch(`${API_BASE_URL}/image/generate/studio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      characterId: input.characterId,
      additionalDetails: input.additionalDetails,
      scene: presetToSnakeCase(input.scene),
      environment: presetToSnakeCase(input.environment),
      outfit: outfitPayload,
      poseId: input.poseId,
      lighting: input.lighting,
      expression: input.expression,
      aspectRatio: input.aspectRatio,
      qualityMode: input.qualityMode,
      count: input.count,
      nsfw: input.nsfw,
      promptEnhance: input.promptEnhance,
      seed: input.seed,
      modelProvider: input.modelProvider,
      modelId: input.modelId,
      isRetry: input.isRetry,
      retryImageId: input.retryImageId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message ||
        error.messages?.[0] ||
        'Failed to start Studio generation'
    );
  }

  return response.json();
}

export async function inpaintEdit(
  input: InpaintEditInput
): Promise<{ jobId: string; promptId: string }> {
  const response = await authFetch(`${API_BASE_URL}/image/edit/inpaint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.messages?.[0] || 'Failed to start inpaint edit'
    );
  }

  return response.json();
}

export async function getComfyUIResults(
  promptId: string
): Promise<ComfyUIJobResult> {
  const response = await authFetch(
    `${API_BASE_URL}/image/comfyui/${promptId}/results`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.messages?.[0] || 'Failed to fetch ComfyUI results'
    );
  }

  return response.json();
}

export interface ApiImageRow {
  id: string;
  characterId: string | null;
  s3Url: string | null;
  thumbnailUrl: string | null;
  prompt: string | null;
  outfit?: string | null;
  poseId?: string | null;
  scene: string | null;
  environment: string | null;
  aspectRatio: AspectRatio | null;
  status: 'pending' | 'generating' | 'completed' | 'failed' | null;
  createdAt: string | null;
  liked?: boolean | null;
  nsfw?: boolean | null;
  // Prompt enhancement metadata
  promptEnhance?: boolean | null;
  originalPrompt?: string | null;
  enhancedPrompt?: string | null;
}

export async function getCharacterImages(
  characterId: string
): Promise<ApiImageRow[]> {
  const response = await authFetch(
    `${API_BASE_URL}/image-gallery/characters/${characterId}/images`
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.messages?.[0] || 'Failed to fetch character images'
    );
  }
  const data = (await response.json()) as { images: ApiImageRow[] };
  return data.images ?? [];
}

export async function likeImage(imageId: string): Promise<{ liked: boolean }> {
  const response = await authFetch(
    `${API_BASE_URL}/image-gallery/images/${imageId}/like`,
    {
      method: 'POST',
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.messages?.[0] || 'Failed to like image'
    );
  }
  const data = (await response.json()) as { liked?: boolean };
  return { liked: Boolean(data.liked) };
}

export async function deleteImage(imageId: string): Promise<void> {
  const response = await authFetch(
    `${API_BASE_URL}/image-gallery/images/${imageId}`,
    {
      method: 'DELETE',
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.messages?.[0] || 'Failed to delete image'
    );
  }
}
