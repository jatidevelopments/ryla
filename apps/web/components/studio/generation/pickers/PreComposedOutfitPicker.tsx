'use client';

import * as React from 'react';
import { OUTFIT_OPTIONS } from '@ryla/shared';
import { usePreComposedOutfitFilter } from '../hooks/usePreComposedOutfitFilter';
import {
  PreComposedOutfitPickerHeader,
  PreComposedOutfitPickerTabs,
  PreComposedOutfitPickerPreview,
  PreComposedOutfitPickerFooter,
  PreComposedOutfitCard,
} from '../components/pre-composed-outfit';
import { PickerDrawer } from './PickerDrawer';

interface PreComposedOutfitPickerProps {
  selectedOutfit: string | null;
  onOutfitSelect: (outfit: string | null) => void;
  onClose: () => void;
  nsfwEnabled?: boolean;
}

export function PreComposedOutfitPicker({
  selectedOutfit,
  onOutfitSelect,
  onClose,
  nsfwEnabled = false,
}: PreComposedOutfitPickerProps) {
  // Filtering and favorites logic
  const filter = usePreComposedOutfitFilter({ nsfwEnabled });

  // Get selected outfit label
  const selectedOutfitLabel = selectedOutfit
    ? OUTFIT_OPTIONS.find(
        (o) => o.label.toLowerCase().replace(/\s+/g, '-') === selectedOutfit
      )?.label || selectedOutfit
    : null;

  return (
    <PickerDrawer
      isOpen={true}
      onClose={onClose}
      title="Ready Outfits"
      className="w-full max-w-7xl h-full md:h-auto"
    >
      <div className="flex flex-col h-full md:max-h-[85vh]">
        {/* Header */}
        <PreComposedOutfitPickerHeader
          search={filter.search}
          onSearchChange={filter.setSearch}
          showFavoritesOnly={filter.showFavoritesOnly}
          onToggleFavorites={() =>
            filter.setShowFavoritesOnly(!filter.showFavoritesOnly)
          }
          onClose={onClose}
        />

        {/* Category Tabs */}
        <PreComposedOutfitPickerTabs
          category={filter.category}
          onCategoryChange={filter.setCategory}
          nsfwEnabled={nsfwEnabled}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {/* Selected Outfit Preview */}
          <PreComposedOutfitPickerPreview
            selectedOutfitLabel={selectedOutfitLabel}
            onClear={() => onOutfitSelect(null)}
            nsfwEnabled={nsfwEnabled}
          />

          {/* Outfits Grid */}
          {filter.availableOutfits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">No outfits found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {filter.availableOutfits.map((outfit) => {
                const outfitValue = outfit.label
                  .toLowerCase()
                  .replace(/\s+/g, '-');
                const isSelected = selectedOutfit === outfitValue;

                return (
                  <PreComposedOutfitCard
                    key={outfitValue}
                    outfit={outfit}
                    isSelected={isSelected}
                    onSelect={() => onOutfitSelect(outfitValue)}
                    isFavorited={filter.isFavorited(outfitValue)}
                    onToggleFavorite={(e) => {
                      e.stopPropagation();
                      filter.toggleFavorite(outfitValue);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <PreComposedOutfitPickerFooter
          outfitCount={filter.availableOutfits.length}
          onApply={() => {
            onOutfitSelect(selectedOutfit);
            onClose();
          }}
        />
      </div>
    </PickerDrawer>
  );
}
