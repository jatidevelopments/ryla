'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { usePosePickerFilters } from './hooks';
import {
  PosePickerHeader,
  PosePickerFilters,
  PosePickerGrid,
  PosePickerFooter,
} from './components';
import { useGalleryFavorites } from '../../../../../lib/hooks/use-gallery-favorites';

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
  const overlayRef = React.useRef<HTMLDivElement>(null);

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8"
    >
      <div 
        className="flex flex-col w-full max-w-7xl max-h-[85vh] bg-[#18181b] rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
    </div>,
    document.body
  );
}

