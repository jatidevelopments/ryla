'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '../auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================================
// Types
// ============================================================================

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
}

interface GetCharacterLoraResponse {
  lora: LoraModel | null;
  message?: string;
}

interface GetMyLorasResponse {
  loras: LoraModel[];
}

interface TrainLoraInput {
  characterId: string;
  triggerWord: string;
  imageUrls: string[];
  maxTrainSteps?: number;
  rank?: number;
  resolution?: number;
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
      return { lora: null };
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
