'use client';

import * as React from 'react';
import {
  createOutfitPreset,
  getOutfitPresets,
  deleteOutfitPreset,
  updateOutfitPreset,
  type OutfitPreset,
} from '../../../../lib/api/outfit-presets';
import type { OutfitComposition } from '@ryla/shared';

export function useOutfitPresets(influencerId: string | undefined) {
  const [presets, setPresets] = React.useState<OutfitPreset[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [editingPreset, setEditingPreset] = React.useState<OutfitPreset | null>(null);
  const [presetName, setPresetName] = React.useState('');
  const [presetDescription, setPresetDescription] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const loadPresets = React.useCallback(async () => {
    if (!influencerId) return;
    setIsLoadingPresets(true);
    try {
      const loadedPresets = await getOutfitPresets(influencerId);
      setPresets(loadedPresets);
    } catch (error) {
      console.error('Failed to load outfit presets:', error);
    } finally {
      setIsLoadingPresets(false);
    }
  }, [influencerId]);

  React.useEffect(() => {
    if (influencerId) {
      loadPresets();
    }
  }, [influencerId, loadPresets]);

  const handleSavePreset = React.useCallback(
    async (composition: OutfitComposition) => {
      if (!influencerId || !composition || !presetName.trim()) return;

      setIsSaving(true);
      try {
        if (editingPreset) {
          // Update existing preset
          await updateOutfitPreset(editingPreset.id, {
            name: presetName.trim(),
            description: presetDescription.trim() || undefined,
            composition,
          });
        } else {
          // Create new preset
          await createOutfitPreset({
            influencerId,
            name: presetName.trim(),
            description: presetDescription.trim() || undefined,
            composition,
          });
        }
        setShowSaveDialog(false);
        setEditingPreset(null);
        setPresetName('');
        setPresetDescription('');
        await loadPresets();
      } catch (error) {
        console.error('Failed to save outfit preset:', error);
        alert('Failed to save outfit preset. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [influencerId, editingPreset, presetName, presetDescription, loadPresets]
  );

  const handleEditPreset = React.useCallback((preset: OutfitPreset) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setPresetDescription(preset.description || '');
    setShowSaveDialog(true);
  }, []);

  const handleDeletePreset = React.useCallback(
    async (presetId: string) => {
      if (!confirm('Are you sure you want to delete this outfit preset?')) return;

      try {
        await deleteOutfitPreset(presetId);
        await loadPresets();
      } catch (error) {
        console.error('Failed to delete outfit preset:', error);
        alert('Failed to delete outfit preset. Please try again.');
      }
    },
    [loadPresets]
  );

  const openSaveDialog = React.useCallback((composition: OutfitComposition | null) => {
    if (!composition) return;
    setEditingPreset(null);
    setPresetName('');
    setPresetDescription('');
    setShowSaveDialog(true);
  }, []);

  const closeSaveDialog = React.useCallback(() => {
    setShowSaveDialog(false);
    setEditingPreset(null);
    setPresetName('');
    setPresetDescription('');
  }, []);

  return {
    presets,
    isLoadingPresets,
    showSaveDialog,
    editingPreset,
    presetName,
    setPresetName,
    presetDescription,
    setPresetDescription,
    isSaving,
    handleSavePreset,
    handleEditPreset,
    handleDeletePreset,
    openSaveDialog,
    closeSaveDialog,
    loadPreset: (preset: OutfitPreset) => preset.composition,
  };
}

