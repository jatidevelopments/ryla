'use client';

import * as React from 'react';
import type { OutfitMode } from '../pickers/OutfitModeSelector';

/**
 * Manages visibility state for all pickers in the generation bar.
 * Consolidates 10+ boolean states into a single manageable hook.
 */
export function usePickerState() {
  const [showModelPicker, setShowModelPicker] = React.useState(false);
  const [showAspectRatioPicker, setShowAspectRatioPicker] = React.useState(false);
  const [showQualityPicker, setShowQualityPicker] = React.useState(false);
  const [showCharacterPicker, setShowCharacterPicker] = React.useState(false);
  const [showStylePicker, setShowStylePicker] = React.useState(false);
  const [showPosePicker, setShowPosePicker] = React.useState(false);
  const [showOutfitModeSelector, setShowOutfitModeSelector] = React.useState(false);
  const [showOutfitPicker, setShowOutfitPicker] = React.useState(false);
  const [outfitMode, setOutfitMode] = React.useState<OutfitMode | null>(null);
  const [showObjectPicker, setShowObjectPicker] = React.useState(false);

  // Close all pickers
  const closeAll = React.useCallback(() => {
    setShowModelPicker(false);
    setShowAspectRatioPicker(false);
    setShowQualityPicker(false);
    setShowCharacterPicker(false);
    setShowStylePicker(false);
    setShowPosePicker(false);
    setShowOutfitModeSelector(false);
    setShowOutfitPicker(false);
    setOutfitMode(null);
    setShowObjectPicker(false);
  }, []);

  // Toggle helpers that close other pickers
  const toggleModel = React.useCallback(() => {
    setShowModelPicker(prev => !prev);
  }, []);

  const toggleAspectRatio = React.useCallback(() => {
    setShowAspectRatioPicker(prev => !prev);
  }, []);

  const toggleQuality = React.useCallback(() => {
    setShowQualityPicker(prev => !prev);
  }, []);

  // Handle outfit mode selection flow
  const selectOutfitMode = React.useCallback((mode: OutfitMode) => {
    setOutfitMode(mode);
    setShowOutfitModeSelector(false);
    setShowOutfitPicker(true);
  }, []);

  const closeOutfitPicker = React.useCallback(() => {
    setShowOutfitPicker(false);
    setOutfitMode(null);
  }, []);

  return {
    // Model picker
    showModelPicker,
    setShowModelPicker,
    toggleModel,
    
    // Aspect ratio picker
    showAspectRatioPicker,
    setShowAspectRatioPicker,
    toggleAspectRatio,
    
    // Quality picker
    showQualityPicker,
    setShowQualityPicker,
    toggleQuality,
    
    // Character picker
    showCharacterPicker,
    setShowCharacterPicker,
    
    // Style picker
    showStylePicker,
    setShowStylePicker,
    
    // Pose picker
    showPosePicker,
    setShowPosePicker,
    
    // Outfit pickers
    showOutfitModeSelector,
    setShowOutfitModeSelector,
    showOutfitPicker,
    setShowOutfitPicker,
    outfitMode,
    setOutfitMode,
    selectOutfitMode,
    closeOutfitPicker,
    
    // Object picker
    showObjectPicker,
    setShowObjectPicker,
    
    // Utilities
    closeAll,
  };
}

export type PickerState = ReturnType<typeof usePickerState>;

