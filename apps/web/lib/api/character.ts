/**
 * Character API client
 * Handles character creation and image generation with the backend
 */

import { authFetch } from '../auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================================
// Types
// ============================================================================

export interface AppearanceInput {
  gender: 'female' | 'male';
  style: 'realistic' | 'anime';
  ethnicity: string;
  age: number;
  ageRange?: string;
  skinColor?: string;
  eyeColor: string;
  faceShape?: string;
  hairStyle: string;
  hairColor: string;
  bodyType: string;
  assSize?: string;
  breastSize?: string;
  breastType?: string;
  freckles?: string;
  scars?: string;
  beautyMarks?: string;
  piercings?: string;
  tattoos?: string;
}

export interface IdentityInput {
  defaultOutfit: string;
  archetype: string;
  personalityTraits: string[];
  bio?: string;
}

export interface GenerateBaseImagesInput {
  appearance: AppearanceInput;
  identity: IdentityInput;
  nsfwEnabled: boolean;
  workflowId?: 'z-image-danrisi' | 'z-image-simple' | 'z-image-pulid';
  seed?: number;
  steps?: number;
  cfg?: number;
  width?: number;
  height?: number;
}

export interface GenerateCharacterSheetInput {
  baseImageUrl: string;
  characterId: string;
  nsfwEnabled: boolean;
}

export interface GenerateProfilePictureSetInput {
  baseImageUrl: string;
  characterId?: string;
  setId: 'classic-influencer' | 'professional-model' | 'natural-beauty';
  nsfwEnabled: boolean;
  generationMode?: 'fast' | 'consistent';
  workflowId?: 'z-image-danrisi' | 'z-image-simple' | 'z-image-pulid';
  steps?: number;
  cfg?: number;
  width?: number;
  height?: number;
}

export interface RegenerateProfilePictureInput {
  baseImageUrl: string;
  positionId: string;
  prompt?: string;
  nsfwEnabled: boolean;
  setId?: 'classic-influencer' | 'professional-model' | 'natural-beauty';
  generationMode?: 'fast' | 'consistent';
  workflowId?: 'z-image-danrisi' | 'z-image-simple' | 'z-image-pulid';
  steps?: number;
  cfg?: number;
  width?: number;
  height?: number;
}

export type JobStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

export interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  s3Key?: string;
  variation?: string;
}

export interface JobResult {
  status: JobStatus;
  images?: GeneratedImage[];
  error?: string;
  warning?: string;
}

export interface GenerationResponse {
  jobId: string;
  allJobIds?: string[]; // For batch jobs (e.g., 3 base images, 7-10 profile pictures)
  jobPositions?: Array<{
    jobId: string;
    positionId: string;
    positionName: string;
    prompt: string;
    negativePrompt: string;
    isNSFW: boolean;
  }>; // For profile pictures - maps job IDs to positions
  userId: string;
  status: string;
  message: string;
  imageCount?: number;
}

// ============================================================================
// Error Helpers
// ============================================================================

/**
 * Extract error message from backend error response
 * Backend returns { messages: string[], statusCode, ... } format
 */
function extractErrorMessage(error: any, defaultMessage: string): string {
  if (Array.isArray(error.messages) && error.messages.length > 0) {
    return error.messages[0];
  }
  if (error.message) {
    return error.message;
  }
  if (typeof error.messages === 'string') {
    return error.messages;
  }
  return defaultMessage;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Start base image generation from wizard config
 */
export async function generateBaseImages(
  input: GenerateBaseImagesInput
): Promise<GenerationResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/generate-base-images`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, 'Failed to start image generation'));
  }

  return response.json();
}

/**
 * Get base image generation results
 * If allJobIds are provided, polls all jobs and returns combined results
 */
export async function getBaseImageResults(
  jobId: string,
  allJobIds?: string[]
): Promise<JobResult> {
  // If we have all job IDs, use batch endpoint
  const url = allJobIds && allJobIds.length > 1
    ? `${API_BASE_URL}/characters/base-images/${jobId}?allJobIds=${allJobIds.join(',')}`
    : `${API_BASE_URL}/characters/base-images/${jobId}`;

  const response = await authFetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, 'Failed to get job results'));
  }

  return response.json();
}

/**
 * Start character sheet generation from selected base image
 */
export async function generateCharacterSheet(
  input: GenerateCharacterSheetInput
): Promise<GenerationResponse & { variations: number }> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/generate-character-sheet`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, 'Failed to start character sheet generation'));
  }

  return response.json();
}

/**
 * Get character sheet generation results
 */
export async function getCharacterSheetResults(
  jobId: string
): Promise<JobResult> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/character-sheet/${jobId}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, 'Failed to get character sheet results'));
  }

  return response.json();
}

// ============================================================================
// Polling Helpers
// ============================================================================

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Poll for job completion
 * Handles both single jobs and batch jobs (returns when all are complete or partial results available)
 */
export async function pollForJobCompletion(
  jobId: string,
  getResults: (jobId: string) => Promise<JobResult>,
  onProgress?: (status: JobStatus) => void
): Promise<JobResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME) {
    const result = await getResults(jobId);
    
    if (onProgress) {
      onProgress(result.status);
    }

    // For batch jobs, "partial" means some jobs are done - continue polling
    // "completed" means all jobs are done
    if (result.status === 'completed' || result.status === 'partial') {
      // If we have images, return them (even if partial)
      if (result.images && result.images.length > 0) {
        // If partial but we have enough images (e.g., 3), return them
        if (result.status === 'partial' && result.images.length >= 3) {
          return { ...result, status: 'completed' };
        }
        // If completed, return immediately
        if (result.status === 'completed') {
          return result;
        }
      }
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Job failed');
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  throw new Error('Job timed out');
}

/**
 * Get results for a single base image job (for progressive loading)
 */
export async function getBaseImageJobResult(
  jobId: string
): Promise<JobResult> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/base-images/${jobId}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, 'Failed to get base image job result'));
  }

  return response.json();
}

/**
 * Generate base images and wait for completion
 * Returns array of GeneratedImage objects with URLs (should be 3 images)
 * Uses progressive loading - images appear as they complete
 */
export async function generateBaseImagesAndWait(
  input: GenerateBaseImagesInput,
  onProgress?: (status: JobStatus) => void,
  onImageComplete?: (image: GeneratedImage, index: number) => void
): Promise<GeneratedImage[]> {
  const { jobId, allJobIds } = await generateBaseImages(input);
  
  // If we have all job IDs, poll individually for progressive loading
  if (allJobIds && allJobIds.length > 1) {
    return pollBaseImagesProgressively(
      allJobIds,
      onProgress,
      onImageComplete
    );
  }

  // Fallback to batch polling
  const result = await pollForJobCompletion(
    jobId,
    (id: string) => getBaseImageResults(id, allJobIds),
    onProgress
  );

  if (!result.images || result.images.length === 0) {
    throw new Error('No images generated');
  }

  // Should have 3 images, but return whatever we got
  return result.images;
}

/**
 * Poll base images progressively - images appear as they complete
 */
async function pollBaseImagesProgressively(
  jobIds: string[],
  onProgress?: (status: JobStatus) => void,
  onImageComplete?: (image: GeneratedImage, index: number) => void
): Promise<GeneratedImage[]> {
  const completedImages: GeneratedImage[] = [];
  const pendingJobs = new Set(jobIds);
  const maxWaitTime = 10 * 60 * 1000; // 10 minutes
  const pollInterval = 2000; // 2 seconds
  const startTime = Date.now();

  while (pendingJobs.size > 0 && Date.now() - startTime < maxWaitTime) {
    // Poll all pending jobs in parallel
    const pollPromises = Array.from(pendingJobs).map(async (jobId) => {
      try {
        const result = await getBaseImageJobResult(jobId);
        return { jobId, result };
      } catch (error) {
        console.error(`Failed to poll job ${jobId}:`, error);
        return { jobId, result: null };
      }
    });

    const results = await Promise.all(pollPromises);

    for (let i = 0; i < results.length; i++) {
      const { jobId, result } = results[i];
      if (!result) continue;

      if (result.status === 'completed' && result.images && result.images.length > 0) {
        // Job completed - add images and remove from pending
        const imageIndex = jobIds.indexOf(jobId);
        result.images.forEach((img) => {
          completedImages.push(img);
          
          // Notify that an image is complete
          if (onImageComplete) {
            onImageComplete(img, imageIndex);
          }
        });
        pendingJobs.delete(jobId);
      } else if (result.status === 'failed') {
        // Job failed - remove from pending
        pendingJobs.delete(jobId);
      }
    }

    if (onProgress) {
      const completedCount = completedImages.length;
      const totalCount = jobIds.length;
      onProgress(completedCount === totalCount ? 'completed' : 'in_progress');
    }

    // Wait before next poll
    if (pendingJobs.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  if (pendingJobs.size > 0) {
    console.warn(`Some base image jobs timed out: ${Array.from(pendingJobs).join(', ')}`);
  }

  return completedImages;
}

/**
 * Generate character sheet and wait for completion
 * Returns array of GeneratedImage objects with URLs
 */
export async function generateCharacterSheetAndWait(
  input: GenerateCharacterSheetInput,
  onProgress?: (status: JobStatus) => void
): Promise<GeneratedImage[]> {
  const { jobId } = await generateCharacterSheet(input);
  
  const result = await pollForJobCompletion(
    jobId,
    getCharacterSheetResults,
    onProgress
  );

  if (!result.images || result.images.length === 0) {
    throw new Error('No character sheet images generated');
  }

  return result.images;
}

/**
 * Start profile picture set generation from selected base image
 */
export async function generateProfilePictureSet(
  input: GenerateProfilePictureSetInput
): Promise<GenerationResponse & { imageCount: number }> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/generate-profile-picture-set`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, 'Failed to start profile picture set generation'));
  }

  return response.json();
}

/**
 * Get profile picture set generation results
 * If allJobIds are provided, polls all jobs and returns combined results
 */
export async function getProfilePictureSetResults(
  jobId: string,
  allJobIds?: string[]
): Promise<JobResult> {
  // If we have all job IDs, use batch endpoint
  const url = allJobIds && allJobIds.length > 1
    ? `${API_BASE_URL}/characters/profile-picture-set/${jobId}?allJobIds=${allJobIds.join(',')}`
    : `${API_BASE_URL}/characters/profile-picture-set/${jobId}`;

  const response = await authFetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, 'Failed to get profile picture set results'));
  }

  return response.json();
}

/**
 * Get results for a single profile picture job (for progressive loading)
 */
export async function getProfilePictureJobResult(
  jobId: string
): Promise<JobResult> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/profile-picture-set/${jobId}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, 'Failed to get profile picture job result'));
  }

  return response.json();
}

/**
 * Regenerate a single profile picture
 */
export async function regenerateProfilePicture(
  input: RegenerateProfilePictureInput
): Promise<GenerationResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/regenerate-profile-picture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(error, 'Failed to regenerate profile picture'));
  }

  return response.json();
}

/**
 * Regenerate a single profile picture and wait for completion
 * Returns the generated image when ready
 */
export async function regenerateProfilePictureAndWait(
  input: RegenerateProfilePictureInput,
  onProgress?: (status: JobStatus) => void
): Promise<GeneratedImage> {
  const { jobId } = await regenerateProfilePicture(input);
  
  // Poll for the regenerated image
  const result = await pollForJobCompletion(
    jobId,
    getProfilePictureJobResult,
    onProgress
  );

  if (!result.images || result.images.length === 0) {
    throw new Error('No image generated from regeneration');
  }

  return result.images[0];
}

/**
 * Generate profile picture set and start polling in background
 * Images are delivered via onImageComplete callback as they complete
 * Does NOT wait for all images - returns immediately after starting polling
 */
export async function generateProfilePictureSetAndWait(
  input: GenerateProfilePictureSetInput,
  onProgress?: (status: JobStatus, error?: string) => void,
  onImageComplete?: (image: GeneratedImage, positionId: string, positionName: string) => void
): Promise<{ jobIds: string[]; jobPositions: any[] }> {
  const { jobId, allJobIds, jobPositions } = await generateProfilePictureSet(input);
  
  // If we have job positions, start polling in background (non-blocking)
  if (jobPositions && jobPositions.length > 0 && allJobIds && allJobIds.length > 0) {
    // Start polling in background - don't wait for completion
    pollProfilePicturesProgressively(
      allJobIds,
      jobPositions,
      onProgress,
      onImageComplete
    ).catch((error) => {
      console.error('Background polling error:', error);
      if (onProgress) {
        onProgress('failed', error instanceof Error ? error.message : 'Background polling failed');
      }
    });

    // Return immediately with job info
    return { jobIds: allJobIds, jobPositions };
  }

  // Fallback: start polling but don't wait
  pollForJobCompletion(
    jobId,
    (id: string) => getProfilePictureSetResults(id, allJobIds),
    onProgress
  ).then((result) => {
    if (result.images && result.images.length > 0 && onImageComplete) {
      result.images.forEach((img) => {
        onImageComplete(img, img.positionId || '', img.positionName || '');
      });
    }
  }).catch((error) => {
    console.error('Background polling error:', error);
    if (onProgress) {
      onProgress('failed', error instanceof Error ? error.message : 'Background polling failed');
    }
  });

  return { jobIds: allJobIds || [jobId], jobPositions: [] };
}

/**
 * Poll profile pictures progressively - images appear as they complete
 */
async function pollProfilePicturesProgressively(
  jobIds: string[],
  jobPositions: Array<{
    jobId: string;
    positionId: string;
    positionName: string;
    prompt: string;
    negativePrompt: string;
    isNSFW: boolean;
  }>,
  onProgress?: (status: JobStatus, error?: string) => void,
  onImageComplete?: (image: GeneratedImage, positionId: string, positionName: string) => void
): Promise<GeneratedImage[]> {
  const completedImages: GeneratedImage[] = [];
  const pendingJobs = new Set(jobIds);
  const maxWaitTime = 10 * 60 * 1000; // 10 minutes
  const pollInterval = 2000; // 2 seconds
  const startTime = Date.now();

  while (pendingJobs.size > 0 && Date.now() - startTime < maxWaitTime) {
    // Poll all pending jobs in parallel
    const pollPromises = Array.from(pendingJobs).map(async (jobId) => {
      try {
        const result = await getProfilePictureJobResult(jobId);
        return { jobId, result };
      } catch (error) {
        console.error(`Failed to poll job ${jobId}:`, error);
        return { jobId, result: null };
      }
    });

    const results = await Promise.all(pollPromises);

    for (const { jobId, result } of results) {
      if (!result) continue;

      if (result.status === 'completed' && result.images && result.images.length > 0) {
        // Job completed - add images and remove from pending
        const position = jobPositions.find((jp) => jp.jobId === jobId);
        if (position) {
          result.images.forEach((img) => {
            const imageWithPosition: GeneratedImage = {
              ...img,
              positionId: position.positionId,
              positionName: position.positionName,
              prompt: position.prompt,
              negativePrompt: position.negativePrompt,
            };
            completedImages.push(imageWithPosition);
            
            // Notify that an image is complete
            if (onImageComplete) {
              onImageComplete(imageWithPosition, position.positionId, position.positionName);
            }
          });
        }
        pendingJobs.delete(jobId);
      } else if (
        result.status === 'failed' ||
        (result.status === 'completed' && (!result.images || result.images.length === 0))
      ) {
        // Job failed - remove from pending
        pendingJobs.delete(jobId);
        if (onProgress && result.error) {
          onProgress('failed', result.error);
        }
      }
    }

    if (onProgress) {
      const completedCount = completedImages.length;
      const totalCount = jobIds.length;
      onProgress(completedCount === totalCount ? 'completed' : 'in_progress');
    }

    // Wait before next poll
    if (pendingJobs.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  if (pendingJobs.size > 0) {
    console.warn(`Some profile picture jobs timed out: ${Array.from(pendingJobs).join(', ')}`);
  }

  return completedImages;
}

