'use client';

import * as React from 'react';
import type { OutfitComposition } from '@ryla/shared';
import { useGalleryFavorites } from '../../../../lib/hooks/use-gallery-favorites';
import { useOutfitComposition } from '../hooks/use-outfit-composition';
import { useOutfitPickerState } from '../hooks/use-outfit-picker-state';
import { useOutfitPresets } from '../hooks/use-outfit-presets';
import { getSelectedPieces } from '../utils/get-selected-pieces';
import type { OutfitPreset } from '../../../../lib/api/outfit-presets';
import {
  OutfitPickerHeader,
  OutfitPickerSearch,
  OutfitPickerCategories,
  SelectedPiecesSidebar,
  OutfitPiecesGrid,
  OutfitPresetsGrid,
  OutfitPickerFooter,
} from '../components/outfit-picker';
import { SavePresetDialog } from '../components/dialogs';
import { PickerDrawer } from './PickerDrawer';

interface OutfitCompositionPickerProps {
  selectedComposition: OutfitComposition | null;
  onCompositionSelect: (composition: OutfitComposition | null) => void;
  onClose: () => void;
  nsfwEnabled?: boolean;
  influencerId?: string;
}

export function OutfitCompositionPicker({
  selectedComposition,
  onCompositionSelect,
  onClose,
  nsfwEnabled = false,
  influencerId,
}: OutfitCompositionPickerProps) {
  // Picker state hook
  const {
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    showFavoritesOnly,
    setShowFavoritesOnly,
  } = useOutfitPickerState();

  // Favorites hook
  const { isFavorited, toggleFavorite } = useGalleryFavorites({
    itemType: 'outfit',
  });

  // Composition hook
  const {
    composition,
    setComposition,
    availablePieces,
    handlePieceSelect,
    handleClearPiece,
    handleClearAll,
    isPieceSelected,
  } = useOutfitComposition({
    initialComposition: selectedComposition,
    nsfwEnabled,
    search,
    activeCategory,
    showFavoritesOnly,
    isFavorited,
  });

  // Presets hook
  const {
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
  } = useOutfitPresets(influencerId);

  const handleLoadPreset = React.useCallback(
    (preset: OutfitPreset) => {
      setComposition(preset.composition);
      setActiveCategory('all');
    },
    [setComposition, setActiveCategory]
  );

  const handleApply = React.useCallback(() => {
    onCompositionSelect(composition);
    onClose();
  }, [composition, onCompositionSelect, onClose]);

  const handleSave = React.useCallback(() => {
    if (composition) {
      openSaveDialog(composition);
    }
  }, [composition, openSaveDialog]);

  const selectedPieces = React.useMemo(
    () => getSelectedPieces(composition),
    [composition]
  );

  return (
    <PickerDrawer
      isOpen={true}
      onClose={onClose}
      title="Customize Outfit"
      className="w-full max-w-7xl h-full md:h-auto"
    >
      <div className="flex flex-col h-full md:max-h-[90vh]">
        <OutfitPickerHeader
          presets={presets}
          influencerId={influencerId}
          onLoadPreset={handleLoadPreset}
          onClose={onClose}
        />

        <OutfitPickerSearch
          search={search}
          onSearchChange={setSearch}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        />

        <OutfitPickerCategories
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          presetsCount={presets.length}
          influencerId={influencerId}
          nsfwEnabled={nsfwEnabled}
        />

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <SelectedPiecesSidebar
            composition={composition}
            nsfwEnabled={nsfwEnabled}
            onClearPiece={handleClearPiece}
            onClearAll={handleClearAll}
          />

          {/* Pieces Grid or Presets */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            {activeCategory === 'presets' ? (
              <OutfitPresetsGrid
                presets={presets}
                isLoading={isLoadingPresets}
                onLoadPreset={handleLoadPreset}
                onEditPreset={handleEditPreset}
                onDeletePreset={handleDeletePreset}
              />
            ) : (
              <OutfitPiecesGrid
                pieces={availablePieces}
                isPieceSelected={isPieceSelected}
                onPieceSelect={handlePieceSelect}
                isFavorited={isFavorited}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </div>
        </div>

        <OutfitPickerFooter
          composition={composition}
          selectedPiecesCount={selectedPieces.length}
          nsfwEnabled={nsfwEnabled}
          influencerId={influencerId}
          onSave={handleSave}
          onCancel={onClose}
          onApply={handleApply}
        />

        <SavePresetDialog
          isOpen={showSaveDialog}
          editingPreset={!!editingPreset}
          presetName={presetName}
          presetDescription={presetDescription}
          isSaving={isSaving}
          onNameChange={setPresetName}
          onDescriptionChange={setPresetDescription}
          onClose={closeSaveDialog}
          onSave={() => composition && handleSavePreset(composition)}
        />
      </div>
    </PickerDrawer>
  );
}
