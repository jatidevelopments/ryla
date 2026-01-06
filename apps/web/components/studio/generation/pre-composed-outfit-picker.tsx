'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { cn, Input, Badge } from '@ryla/ui';
import {
  OUTFIT_OPTIONS,
  OUTFIT_CATEGORIES,
  type OutfitOption,
} from '@ryla/shared';
import { usePreComposedOutfitFilter } from './hooks/usePreComposedOutfitFilter';

interface PreComposedOutfitPickerProps {
  selectedOutfit: string | null;
  onOutfitSelect: (outfit: string | null) => void;
  onClose: () => void;
  nsfwEnabled?: boolean;
}

type OutfitCategory = (typeof OUTFIT_CATEGORIES)[number];

const CATEGORY_LABELS: Record<OutfitCategory, string> = {
  casual: 'Casual',
  glamour: 'Glamour',
  intimate: 'Intimate',
  fantasy: 'Fantasy',
  kinky: 'Kinky',
  sexual: 'Sexual',
};

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
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 text-[var(--purple-400)]"
              >
                <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pre-Composed Outfits</h2>
              <p className="text-sm text-white/50">
                Choose from 70 ready outfit combinations
              </p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search, Favorites Filter & Close */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => filter.setShowFavoritesOnly(!filter.showFavoritesOnly)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                filter.showFavoritesOnly
                  ? 'bg-[var(--purple-500)] text-white shadow-lg shadow-[var(--purple-500)]/25'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn('h-4 w-4', filter.showFavoritesOnly && 'fill-current')}
              >
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
              </svg>
              <span className="hidden sm:inline">Favorites</span>
            </button>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <Input
                type="text"
                placeholder="Search outfits..."
                value={filter.search}
                onChange={(e) => filter.setSearch(e.target.value)}
                className="w-64 pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 overflow-x-auto scroll-hidden">
          <button
            onClick={() => filter.setCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              filter.category === 'all'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            )}
          >
            All
          </button>
          {OUTFIT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => filter.setCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                filter.category === cat
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}

          {/* Adult Content Badge - Show if Adult Content is enabled */}
          {nsfwEnabled && (
            <>
              <div className="h-6 w-px bg-white/10" />
              <div className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5 text-orange-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-medium text-orange-400">
                  Adult Content Enabled
                </span>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Selected Outfit Preview */}
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex-1">
                <div className="text-xs text-white/60 mb-1">Selected Outfit</div>
                {selectedOutfitLabel ? (
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{selectedOutfitLabel}</span>
                    <button
                      onClick={() => onOutfitSelect(null)}
                      className="ml-1 text-white/40 hover:text-white transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <span className="text-white/40 text-sm">
                    {nsfwEnabled
                      ? 'No outfit (recommended for Adult Content)'
                      : 'No outfit selected'}
                  </span>
                )}
              </div>
            </div>
          </div>

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
                  <OutfitCard
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#18181b]">
          <div className="text-sm text-white/60">
            {filter.availableOutfits.length} outfit{filter.availableOutfits.length !== 1 ? 's' : ''} available
          </div>
          <button
            onClick={() => {
              onOutfitSelect(selectedOutfit);
              onClose();
            }}
            className="px-8 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors shadow-lg shadow-[var(--purple-500)]/25"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Outfit Card Component
function OutfitCard({
  outfit,
  isSelected,
  onSelect,
  isFavorited,
  onToggleFavorite,
}: {
  outfit: OutfitOption;
  isSelected: boolean;
  onSelect: () => void;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}) {
  return (
    <div>
      <button
        onClick={onSelect}
        className={cn(
          'group relative w-full rounded-xl overflow-hidden border-2 transition-all bg-gradient-to-br from-white/5 to-white/[0.02]',
          isSelected
            ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
            : 'border-transparent hover:border-white/30'
        )}
      >
        {/* Outfit Display */}
        <div className="relative aspect-[4/5] bg-white/5 overflow-hidden">
          {outfit.thumbnail ? (
            <>
              <Image
                src={outfit.thumbnail}
                alt={outfit.label}
                fill
                className="object-cover"
                unoptimized
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <div className="text-sm font-semibold text-white mb-1">
                  {outfit.label}
                </div>
                {outfit.category && (
                  <div className="text-xs text-white/60 capitalize">
                    {outfit.category}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 h-full">
              {/* Emoji/Icon */}
              <div className="text-5xl mb-3">{outfit.emoji}</div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-sm font-semibold text-white mb-1">
                  {outfit.label}
                </div>
                {outfit.category && (
                  <div className="text-xs text-white/60 capitalize">
                    {outfit.category}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Adult badge */}
        {outfit.isAdult && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <Badge
              variant="error"
              size="default"
              className="uppercase font-bold text-xs px-3 py-1.5 bg-red-600/90 text-white border-red-500 shadow-lg shadow-red-500/50"
            >
              18+
            </Badge>
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-white"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Like button */}
        <button
          onClick={onToggleFavorite}
          className={cn(
            'absolute top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100',
            outfit.isAdult ? 'right-12' : 'right-2',
            isFavorited
              ? 'bg-[var(--pink-500)] text-white opacity-100'
              : 'bg-black/50 text-white/60 hover:bg-black/70 hover:text-white'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn('h-4 w-4', isFavorited && 'fill-current')}
          >
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
          </svg>
        </button>
      </button>
    </div>
  );
}

