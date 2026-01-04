'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { cn, Input, Badge } from '@ryla/ui';
import { ALL_POSES, SFW_POSES, ADULT_POSES, POSE_CATEGORIES, type Pose } from './types';
import { useGalleryFavorites } from '../../../lib/hooks/use-gallery-favorites';

interface PosePickerProps {
  selectedPoseId: string | null;
  onPoseSelect: (id: string | null) => void;
  onClose: () => void;
  nsfwEnabled: boolean;
}

type PoseCategory = typeof POSE_CATEGORIES[number]['id'];

export function PosePicker({
  selectedPoseId,
  onPoseSelect,
  onClose,
  nsfwEnabled,
}: PosePickerProps) {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<PoseCategory>('all');
  const [adultOnly, setAdultOnly] = React.useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  
  // Favorites hook
  const { isFavorited, toggleFavorite } = useGalleryFavorites({
    itemType: 'pose',
  });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Filter poses based on Adult Content, category, adult filter, and favorites
  const availablePoses = React.useMemo(() => {
    let basePoses = nsfwEnabled ? [...SFW_POSES, ...ADULT_POSES] : SFW_POSES;
    
    // Filter for adult-only if enabled
    if (adultOnly && nsfwEnabled) {
      basePoses = ADULT_POSES;
    }
    
    return basePoses.filter(pose => {
      const matchesSearch = pose.name.toLowerCase().includes(search.toLowerCase()) ||
                           pose.prompt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || pose.category === category;
      const matchesFavorites = !showFavoritesOnly || isFavorited(pose.id);
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [nsfwEnabled, search, category, adultOnly, showFavoritesOnly, isFavorited]);

  // Count filtered adult poses for disclaimer
  const filteredAdultPoseCount = React.useMemo(() => {
    if (nsfwEnabled) return 0;
    
    const allAdultPoses = ADULT_POSES.filter(pose => {
      const matchesSearch = pose.name.toLowerCase().includes(search.toLowerCase()) ||
                           pose.prompt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || pose.category === category;
      return matchesSearch && matchesCategory;
    });
    
    return allAdultPoses.length;
  }, [nsfwEnabled, search, category]);

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
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[var(--purple-400)]">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 0114 0v1H3v-1zm7-4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pose Selection</h2>
              <p className="text-sm text-white/50">Choose a pose to add to your prompt</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search, Favorites Filter & Close */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                showFavoritesOnly
                  ? 'bg-[var(--purple-500)] text-white shadow-lg shadow-[var(--purple-500)]/25'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cn('h-4 w-4', showFavoritesOnly && 'fill-current')}>
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
              </svg>
              <span className="hidden sm:inline">Favorites</span>
            </button>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <Input
                type="text"
                placeholder="Search poses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44 h-10 pl-9 pr-4 bg-[#0d0d0f] border-white/10 rounded-xl text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0"
              />
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-col gap-3 border-b border-white/5">
          <div className="flex items-center gap-3 px-6 py-5 overflow-x-auto scroll-hidden">
            {POSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as PoseCategory)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  category === cat.id
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                {cat.label}
              </button>
            ))}
            
            {/* 18+ Filter - Only show if Adult Content is enabled */}
            {nsfwEnabled && (
              <>
                <div className="h-6 w-px bg-white/10" />
                <button
                  onClick={() => setAdultOnly(!adultOnly)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2',
                    adultOnly
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  <span>18+ Only</span>
                </button>
              </>
            )}
          </div>
          
          {/* Disclaimer when NFSV poses are filtered */}
          {!nsfwEnabled && filteredAdultPoseCount > 0 && (
            <div className="px-6 pb-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-orange-400 flex-shrink-0">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-orange-300">
                  {filteredAdultPoseCount} adult pose{filteredAdultPoseCount !== 1 ? 's' : ''} filtered because adult content is disabled
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
            {/* None option */}
            <div className="break-inside-avoid mb-3">
              <button
                onClick={() => onPoseSelect(null)}
                className={cn(
                  'w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center bg-white/5',
                  !selectedPoseId
                    ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
                    : 'border-transparent hover:border-white/30'
                )}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">✕</div>
                  <span className="text-sm font-medium text-white/60">None</span>
                </div>
              </button>
            </div>
            
            {availablePoses.map((pose) => (
              <PoseCard
                key={pose.id}
                pose={pose}
                isSelected={selectedPoseId === pose.id}
                onSelect={() => onPoseSelect(pose.id)}
                isFavorited={isFavorited(pose.id)}
                onToggleFavorite={(e) => {
                  e.stopPropagation();
                  toggleFavorite(pose.id);
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-white/10 bg-[#0d0d0f]">
          <div className="flex items-center gap-3">
            {selectedPoseId ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="text-white/50 text-sm">Pose:</span>
                <span className="text-white font-medium text-sm">
                  {ALL_POSES.find(p => p.id === selectedPoseId)?.name}
                </span>
                <button 
                  onClick={() => onPoseSelect(null)} 
                  className="ml-1 text-white/40 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ) : (
              <span className="text-white/40 text-sm">No pose selected</span>
            )}
          </div>

          <button
            onClick={onClose}
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

// Pose Card Component
function PoseCard({
  pose,
  isSelected,
  onSelect,
  isFavorited,
  onToggleFavorite,
}: {
  pose: Pose;
  isSelected: boolean;
  onSelect: () => void;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="break-inside-avoid mb-3">
      <button
        onClick={onSelect}
        className={cn(
          'group relative w-full rounded-xl overflow-hidden border-2 transition-all bg-gradient-to-br from-white/5 to-white/[0.02]',
          isSelected
            ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
            : 'border-transparent hover:border-white/30'
        )}
      >
        {/* Thumbnail Image or Icon Fallback */}
        <div className="relative aspect-[4/5] bg-white/5 overflow-hidden">
          {pose.thumbnail ? (
            <>
              <Image
                src={pose.thumbnail}
                alt={pose.name}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-sm font-semibold text-white mb-1">{pose.name}</div>
                <div className="text-xs text-white/60 line-clamp-1">{pose.prompt}</div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 h-full">
              <div className="text-5xl mb-3">{pose.icon}</div>
              <div className="text-center">
                <div className="text-sm font-semibold text-white mb-1">{pose.name}</div>
                <div className="text-xs text-white/50 line-clamp-2">{pose.prompt}</div>
              </div>
            </div>
          )}
          
          {/* Adult badge */}
          {pose.isAdult && (
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
        </div>

          {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Like button */}
        <button
          onClick={onToggleFavorite}
          className={cn(
            'absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100',
            isFavorited
              ? 'bg-[var(--pink-500)] text-white opacity-100'
              : 'bg-black/50 text-white/60 hover:bg-black/70 hover:text-white'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cn('h-4 w-4', isFavorited && 'fill-current')}>
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
          </svg>
        </button>
      </button>
    </div>
  );
}

