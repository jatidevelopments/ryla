'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '../auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================================
// Types
// ============================================================================

/**
 * Supported LoRA model types for training
 */
export type LoraModelType = 'flux' | 'wan' | 'wan-14b' | 'qwen';

export interface LoraModel {
  id: string;
  characterId: string;
  status: 'pending' | 'training' | 'ready' | 'failed' | 'expired';
  triggerWord: string | null;
  modelPath: string | null;
  trainingSteps: number | null;
  trainingDurationMs: number | null;
  creditsCharged: number | null;
  creditsRefunded: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  loraEnabled?: boolean;
  /** Model type used for training */
  trainingModel?: LoraModelType;
}

interface GetCharacterLoraResponse {
  lora: LoraModel | null;
  loraEnabled: boolean;
  message?: string;
}

interface GetMyLorasResponse {
  loras: LoraModel[];
}

interface TrainLoraInput {
  characterId: string;
  triggerWord: string;
  /** Model type for training: flux (images), wan (video), wan-14b (video HQ), qwen (images) */
  modelType?: LoraModelType;
  /** Media URLs (images for flux/qwen, videos for wan) */
  mediaUrls?: string[];
  /** @deprecated Use mediaUrls instead */
  imageUrls?: string[];
  maxTrainSteps?: number;
  rank?: number;
  resolution?: number;
  /** Model size for Wan training: "1.3B" or "14B" */
  modelSize?: string;
  /** Number of frames for video training */
  numFrames?: number;
}

export interface TrainingImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  liked: boolean;
  createdAt: string;
}

interface GetAvailableImagesResponse {
  images: TrainingImage[];
  likedCount: number;
  totalCount: number;
  canTrain: boolean;
  minImagesRequired: number;
  message: string | null;
}

interface TrainLoraResponse {
  jobId: string;
  loraModelId: string;
  callId: string;
  status: string;
  message: string;
  modelType?: LoraModelType;
  mediaCount?: number;
  estimatedMinutes?: number;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchCharacterLora(
  characterId: string
): Promise<GetCharacterLoraResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/${characterId}/lora`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return { lora: null, loraEnabled: false };
    }
    throw new Error('Failed to fetch LoRA status');
  }

  return response.json();
}

async function fetchMyLoras(): Promise<GetMyLorasResponse> {
  const response = await authFetch(`${API_BASE_URL}/characters/my-loras`);

  if (!response.ok) {
    throw new Error('Failed to fetch LoRA models');
  }

  return response.json();
}

async function startLoraTraining(
  input: TrainLoraInput
): Promise<TrainLoraResponse> {
  const response = await authFetch(`${API_BASE_URL}/characters/train-lora`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to start LoRA training');
  }

  return response.json();
}

async function fetchAvailableTrainingImages(
  characterId: string
): Promise<GetAvailableImagesResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/${characterId}/lora/available-images`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch available images');
  }

  return response.json();
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get LoRA model for a specific character
 */
export function useCharacterLora(characterId: string | null | undefined) {
  return useQuery({
    queryKey: ['characterLora', characterId],
    queryFn: () => fetchCharacterLora(characterId!),
    enabled: !!characterId,
    refetchInterval: (query) => {
      // Poll every 10s if training is in progress
      const data = query.state.data;
      if (
        data?.lora?.status === 'training' ||
        data?.lora?.status === 'pending'
      ) {
        return 10000;
      }
      return false;
    },
  });
}

/**
 * Hook to get all LoRA models for the current user
 */
export function useMyLoras() {
  return useQuery({
    queryKey: ['myLoras'],
    queryFn: fetchMyLoras,
  });
}

/**
 * Hook to start LoRA training
 */
export function useStartLoraTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startLoraTraining,
    onSuccess: (data, variables) => {
      // Invalidate character lora query to refresh status
      queryClient.invalidateQueries({
        queryKey: ['characterLora', variables.characterId],
      });
      queryClient.invalidateQueries({ queryKey: ['myLoras'] });
    },
  });
}

/**
 * Hook to get available images for LoRA training
 */
export function useAvailableTrainingImages(
  characterId: string | null | undefined
) {
  return useQuery({
    queryKey: ['availableTrainingImages', characterId],
    queryFn: () => fetchAvailableTrainingImages(characterId!),
    enabled: !!characterId,
  });
}

// ============================================================================
// Model Types
// ============================================================================

export interface LoraModelTypeInfo {
  id: LoraModelType;
  name: string;
  description: string;
  mediaType: 'images' | 'videos';
  minMedia: number;
  maxMedia: number;
  estimatedMinutes: string;
}

interface GetModelTypesResponse {
  modelTypes: LoraModelTypeInfo[];
}

async function fetchLoraModelTypes(): Promise<GetModelTypesResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/lora-model-types`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch model types');
  }

  return response.json();
}

/**
 * Hook to get available LoRA model types
 */
export function useLoraModelTypes() {
  return useQuery({
    queryKey: ['loraModelTypes'],
    queryFn: fetchLoraModelTypes,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// ============================================================================
// Toggle LoRA Enabled
// ============================================================================

interface ToggleLoraInput {
  characterId: string;
  enabled: boolean;
}

interface ToggleLoraResponse {
  characterId: string;
  loraEnabled: boolean;
  message: string;
}

async function toggleLoraEnabled(
  input: ToggleLoraInput
): Promise<ToggleLoraResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/${input.characterId}/lora/toggle`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: input.enabled }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to toggle LoRA setting');
  }

  return response.json();
}

/**
 * Hook to toggle LoRA enabled/disabled for a character
 */
export function useToggleLoraEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLoraEnabled,
    onSuccess: (data, variables) => {
      // Invalidate character queries to refresh state
      queryClient.invalidateQueries({
        queryKey: ['characterLora', variables.characterId],
      });
      queryClient.invalidateQueries({
        queryKey: ['character', variables.characterId],
      });
    },
  });
}

// ============================================================================
// Training History
// ============================================================================

export interface TrainingHistoryItem {
  id: string;
  status: 'pending' | 'training' | 'ready' | 'failed' | 'expired';
  triggerWord: string | null;
  trainingSteps: number | null;
  trainingDurationMs: number | null;
  creditsCharged: number | null;
  creditsRefunded: number | null;
  errorMessage: string | null;
  imageCount: number;
  createdAt: string;
  completedAt: string | null;
}

interface GetTrainingHistoryResponse {
  history: TrainingHistoryItem[];
  totalCount: number;
}

async function fetchTrainingHistory(
  characterId: string
): Promise<GetTrainingHistoryResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/${characterId}/lora/history`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch training history');
  }

  return response.json();
}

/**
 * Hook to get LoRA training history for a character
 */
export function useTrainingHistory(characterId: string | null | undefined) {
  return useQuery({
    queryKey: ['trainingHistory', characterId],
    queryFn: () => fetchTrainingHistory(characterId!),
    enabled: !!characterId,
  });
}

// ============================================================================
// New Liked Images Check
// ============================================================================

export interface NewLikedImagesCheckResponse {
  hasNewLikedImages: boolean;
  newLikedImageCount: number;
  totalLikedCount: number;
  lastTrainingDate: string | null;
  lastTrainingStatus?: 'pending' | 'training' | 'ready' | 'failed' | 'expired';
  canRetrain?: boolean;
  freeRetry?: boolean;
  canTrain?: boolean;
  suggestion: string | null;
}

async function fetchNewLikedImagesCheck(
  characterId: string
): Promise<NewLikedImagesCheckResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/${characterId}/lora/new-images-check`
  );

  if (!response.ok) {
    throw new Error('Failed to check new liked images');
  }

  return response.json();
}

/**
 * Hook to check for new liked images since last LoRA training
 * Used to suggest retraining for better model quality
 */
export function useNewLikedImagesCheck(
  characterId: string | null | undefined
) {
  return useQuery({
    queryKey: ['newLikedImagesCheck', characterId],
    queryFn: () => fetchNewLikedImagesCheck(characterId!),
    enabled: !!characterId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
