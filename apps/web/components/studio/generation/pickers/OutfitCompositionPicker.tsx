'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
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
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Picker state hook
  const {
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    showFavoritesOnly,
    setShowFavoritesOnly,
    mounted,
  } = useOutfitPickerState();

  // Favorites hook
  const { isFavorited, toggleFavorite } = useGalleryFavorites({
    itemType: 'outfit-piece',
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

  const handleOverlayClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
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

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl max-h-[90vh] flex flex-col bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
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
        <div className="flex-1 flex overflow-hidden">
          <SelectedPiecesSidebar
            composition={composition}
            nsfwEnabled={nsfwEnabled}
            onClearPiece={handleClearPiece}
            onClearAll={handleClearAll}
          />

          {/* Pieces Grid or Presets */}
          <div className="flex-1 overflow-y-auto p-4">
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
          editingPreset={editingPreset}
          presetName={presetName}
          presetDescription={presetDescription}
          isSaving={isSaving}
          onNameChange={setPresetName}
          onDescriptionChange={setPresetDescription}
          onClose={closeSaveDialog}
          onSave={() => composition && handleSavePreset(composition)}
        />
      </div>
    </div>,
    document.body
  );
}
