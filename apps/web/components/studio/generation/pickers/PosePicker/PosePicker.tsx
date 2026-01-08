'use client';

import * as React from 'react';
import { usePosePickerFilters } from './hooks';
import {
  PosePickerHeader,
  PosePickerFilters,
  PosePickerGrid,
  PosePickerFooter,
} from './components';
import { useGalleryFavorites } from '../../../../../lib/hooks/use-gallery-favorites';
import { PickerDrawer } from '../PickerDrawer';

interface PosePickerProps {
  selectedPoseId: string | null;
  onPoseSelect: (id: string | null) => void;
  onClose: () => void;
  nsfwEnabled: boolean;
}

export function PosePicker({
  selectedPoseId,
  onPoseSelect,
  onClose,
  nsfwEnabled,
}: PosePickerProps) {
  // Favorites hook
  const { isFavorited, toggleFavorite } = useGalleryFavorites({
    itemType: 'pose',
  });

  // Filtering logic
  const {
    search,
    setSearch,
    category,
    setCategory,
    adultOnly,
    setAdultOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,
    availablePoses,
    filteredAdultPoseCount,
  } = usePosePickerFilters({ nsfwEnabled });

  return (
    <PickerDrawer
      isOpen={true}
      onClose={onClose}
      title="Poses"
      className="w-full max-w-7xl h-full md:h-auto"
    >
      <div className="flex flex-col h-full md:max-h-[85vh]">
        {/* Header - Custom for PosePicker */}
        <PosePickerHeader
          search={search}
          onSearchChange={setSearch}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
          onClose={onClose}
        />

        {/* Category Filters */}
        <PosePickerFilters
          category={category}
          onCategoryChange={setCategory}
          nsfwEnabled={nsfwEnabled}
          adultOnly={adultOnly}
          onAdultOnlyToggle={() => setAdultOnly(!adultOnly)}
          filteredAdultPoseCount={filteredAdultPoseCount}
        />

        {/* Content - Scrollable area */}
        <PosePickerGrid
          availablePoses={availablePoses}
          selectedPoseId={selectedPoseId}
          onPoseSelect={onPoseSelect}
          isFavorited={isFavorited}
          onToggleFavorite={toggleFavorite}
        />

        {/* Footer */}
        <PosePickerFooter
          selectedPoseId={selectedPoseId}
          onPoseSelect={onPoseSelect}
          onClose={onClose}
        />
      </div>
    </PickerDrawer>
  );
}
