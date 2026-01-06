'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { OUTFIT_OPTIONS } from '@ryla/shared';
import { usePreComposedOutfitFilter } from '../hooks/usePreComposedOutfitFilter';
import {
  PreComposedOutfitPickerHeader,
  PreComposedOutfitPickerTabs,
  PreComposedOutfitPickerPreview,
  PreComposedOutfitPickerFooter,
  PreComposedOutfitCard,
} from '../components/pre-composed-outfit';

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
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Filtering and favorites logic
  const filter = usePreComposedOutfitFilter({ nsfwEnabled });

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

  // Get selected outfit label
  const selectedOutfitLabel = selectedOutfit
    ? OUTFIT_OPTIONS.find(
        (o) => o.label.toLowerCase().replace(/\s+/g, '-') === selectedOutfit
      )?.label || selectedOutfit
    : null;

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
        <PreComposedOutfitPickerHeader
          search={filter.search}
          onSearchChange={filter.setSearch}
          showFavoritesOnly={filter.showFavoritesOnly}
          onToggleFavorites={() => filter.setShowFavoritesOnly(!filter.showFavoritesOnly)}
          onClose={onClose}
        />

        {/* Category Tabs */}
        <PreComposedOutfitPickerTabs
          category={filter.category}
          onCategoryChange={filter.setCategory}
          nsfwEnabled={nsfwEnabled}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
    </div>,
    document.body
  );
}

