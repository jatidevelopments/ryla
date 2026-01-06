'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { VISUAL_STYLES, SCENES, LIGHTING_SETTINGS } from '../../types';

interface StyleCardProps {
  id: string;
  name: string;
  thumbnail: string;
  isSelected: boolean;
  onSelect: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

function StyleCard({ id, name, thumbnail, isSelected, onSelect, isFavorited, onToggleFavorite }: StyleCardProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="break-inside-avoid mb-3">
      <button
        onClick={onSelect}
        className={cn(
          'group relative w-full rounded-xl overflow-hidden border-2 transition-all',
          isSelected
            ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
            : 'border-transparent hover:border-white/30'
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] bg-white/5">
          {!imgError ? (
            <Image
              src={thumbnail}
              alt={name}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20">
              <span className="text-3xl font-bold text-white/20">{name.charAt(0)}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span className="text-sm font-medium text-white uppercase">{name}</span>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Like button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={cn(
              'absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100',
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
        )}
      </button>
    </div>
  );
}

interface NoneOptionButtonProps {
  isSelected: boolean;
  onSelect: () => void;
}

function NoneOptionButton({ isSelected, onSelect }: NoneOptionButtonProps) {
  return (
    <div className="break-inside-avoid mb-3">
      <button
        onClick={onSelect}
        className={cn(
          'w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-white/5',
          isSelected
            ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
            : 'border-transparent hover:border-white/30'
        )}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">✕</div>
          <span className="text-sm font-medium text-white/60">None</span>
        </div>
      </button>
    </div>
  );
}

interface GridItem {
  id: string;
  name: string;
  thumbnail: string;
}

interface GridPickerProps<T extends GridItem> {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isFavorited: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

function GridPicker<T extends GridItem>({
  items,
  selectedId,
  onSelect,
  isFavorited,
  onToggleFavorite,
}: GridPickerProps<T>) {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
      <NoneOptionButton isSelected={selectedId === null} onSelect={() => onSelect(null)} />
      {items.map((item) => (
        <StyleCard
          key={item.id}
          id={item.id}
          name={item.name}
          thumbnail={item.thumbnail}
          isSelected={selectedId === item.id}
          onSelect={() => onSelect(item.id)}
          isFavorited={isFavorited(item.id)}
          onToggleFavorite={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
        />
      ))}
    </div>
  );
}

interface StylesGridProps {
  filteredStyles: typeof VISUAL_STYLES;
  selectedStyleId: string | null;
  onStyleSelect: (id: string | null) => void;
  isFavorited: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export function StylesGrid({
  filteredStyles,
  selectedStyleId,
  onStyleSelect,
  isFavorited,
  onToggleFavorite,
}: StylesGridProps) {
  return (
    <GridPicker
      items={filteredStyles}
      selectedId={selectedStyleId}
      onSelect={onStyleSelect}
      isFavorited={isFavorited}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

interface ScenesGridProps {
  filteredScenes: typeof SCENES;
  selectedSceneId: string | null;
  onSceneSelect: (id: string | null) => void;
  isFavorited: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export function ScenesGrid({
  filteredScenes,
  selectedSceneId,
  onSceneSelect,
  isFavorited,
  onToggleFavorite,
}: ScenesGridProps) {
  return (
    <GridPicker
      items={filteredScenes}
      selectedId={selectedSceneId}
      onSelect={onSceneSelect}
      isFavorited={isFavorited}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

interface LightingGridProps {
  filteredLighting: typeof LIGHTING_SETTINGS;
  selectedLightingId: string | null;
  onLightingSelect: (id: string | null) => void;
  isFavorited: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export function LightingGrid({
  filteredLighting,
  selectedLightingId,
  onLightingSelect,
  isFavorited,
  onToggleFavorite,
}: LightingGridProps) {
  return (
    <GridPicker
      items={filteredLighting}
      selectedId={selectedLightingId}
      onSelect={onLightingSelect}
      isFavorited={isFavorited}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

