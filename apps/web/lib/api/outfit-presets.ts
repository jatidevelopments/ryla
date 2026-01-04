/**
 * Outfit Presets API client
 * CRUD operations for saved outfit compositions
 */

import { authFetch } from '../auth';
import type { OutfitComposition } from '@ryla/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface OutfitPreset {
  id: string;
  influencerId: string;
  userId: string;
  name: string;
  description?: string;
  composition: OutfitComposition;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutfitPresetInput {
  influencerId: string;
  name: string;
  description?: string;
  composition: OutfitComposition;
  isDefault?: boolean;
}

export interface UpdateOutfitPresetInput {
  name?: string;
  description?: string;
  composition?: OutfitComposition;
  isDefault?: boolean;
}

export async function createOutfitPreset(
  input: CreateOutfitPresetInput,
): Promise<OutfitPreset> {
  const response = await authFetch(`${API_BASE_URL}/outfit-presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.messages?.[0] || 'Failed to create outfit preset');
  }

  return response.json();
}

export async function getOutfitPresets(influencerId: string): Promise<OutfitPreset[]> {
  const response = await authFetch(
    `${API_BASE_URL}/outfit-presets/influencer/${influencerId}`,
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.messages?.[0] || 'Failed to fetch outfit presets');
  }

  return response.json();
}

export async function getOutfitPreset(presetId: string): Promise<OutfitPreset> {
  const response = await authFetch(`${API_BASE_URL}/outfit-presets/${presetId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.messages?.[0] || 'Failed to fetch outfit preset');
  }

  return response.json();
}

export async function updateOutfitPreset(
  presetId: string,
  input: UpdateOutfitPresetInput,
): Promise<OutfitPreset> {
  const response = await authFetch(`${API_BASE_URL}/outfit-presets/${presetId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.messages?.[0] || 'Failed to update outfit preset');
  }

  return response.json();
}

export async function deleteOutfitPreset(presetId: string): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/outfit-presets/${presetId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.messages?.[0] || 'Failed to delete outfit preset');
  }
}

