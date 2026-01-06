'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { VISUAL_STYLES, SCENES, LIGHTING_SETTINGS } from '../types';

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
    <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
      {/* None option */}
      <div className="break-inside-avoid mb-3">
        <button
          onClick={() => onStyleSelect(null)}
          className={cn(
            'w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-white/5',
            !selectedStyleId
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
      {filteredStyles.map((style) => (
        <StyleCard
          key={style.id}
          id={style.id}
          name={style.name}
          thumbnail={style.thumbnail}
          isSelected={selectedStyleId === style.id}
          onSelect={() => onStyleSelect(style.id)}
          isFavorited={isFavorited(style.id)}
          onToggleFavorite={(e) => {
            e.stopPropagation();
            onToggleFavorite(style.id);
          }}
        />
      ))}
    </div>
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
    <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
      {/* None option */}
      <div className="break-inside-avoid mb-3">
        <button
          onClick={() => onSceneSelect(null)}
          className={cn(
            'w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-white/5',
            !selectedSceneId
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
      {filteredScenes.map((scene) => (
        <StyleCard
          key={scene.id}
          id={scene.id}
          name={scene.name}
          thumbnail={scene.thumbnail}
          isSelected={selectedSceneId === scene.id}
          onSelect={() => onSceneSelect(scene.id)}
          isFavorited={isFavorited(scene.id)}
          onToggleFavorite={(e) => {
            e.stopPropagation();
            onToggleFavorite(scene.id);
          }}
        />
      ))}
    </div>
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
    <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
      {/* None option */}
      <div className="break-inside-avoid mb-3">
        <button
          onClick={() => onLightingSelect(null)}
          className={cn(
            'w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-white/5',
            !selectedLightingId
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
      {filteredLighting.map((light) => (
        <StyleCard
          key={light.id}
          id={light.id}
          name={light.name}
          thumbnail={light.thumbnail}
          isSelected={selectedLightingId === light.id}
          onSelect={() => onLightingSelect(light.id)}
          isFavorited={isFavorited(light.id)}
          onToggleFavorite={(e) => {
            e.stopPropagation();
            onToggleFavorite(light.id);
          }}
        />
      ))}
    </div>
  );
}

