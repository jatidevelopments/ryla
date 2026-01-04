'use client';

import * as React from 'react';
import Image from 'next/image';
import { profilePictureSets } from '@ryla/business';
import { cn } from '@ryla/ui';

interface ProfilePictureSetSelectorProps {
  selectedSetId: string | null;
  onSelect: (setId: string | null) => void;
  creditCost: number;
}

// Map set IDs to their preview images, theme colors, and position previews
// Uses position IDs from profile-picture-sets.ts for actual pose previews
const setConfigs = {
  'classic-influencer': {
    // All 8 position IDs for preview images
    positions: [
      'beach-full-body', 'cafe-cross-legged', 'gym-stretching', 'rooftop-back-view',
      'park-dancing', 'street-leaning', 'home-lounging', 'pool-sitting-edge'
    ],
    gradient: 'from-orange-500 to-pink-500',
    bgGradient: 'from-orange-500/20 to-pink-500/10',
    borderColor: 'border-orange-400',
    shadowColor: 'shadow-orange-500/20',
    iconBg: 'bg-gradient-to-br from-orange-500/30 to-pink-500/30',
    badgeColor: 'bg-orange-500/20 text-orange-300',
    emoji: '✨',
    shortDesc: 'Beach • Café • Gym • Rooftop • Pool • Street • Home',
  },
  'professional-model': {
    // All 9 position IDs for preview images
    positions: [
      'runway-walk', 'studio-pose', 'gallery-side', 'rooftop-dramatic', 'sitting-elegant',
      'street-strut', 'boutique-leaning', 'studio-dynamic', 'close-up-beauty'
    ],
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-500/20 to-indigo-500/10',
    borderColor: 'border-blue-400',
    shadowColor: 'shadow-blue-500/20',
    iconBg: 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30',
    badgeColor: 'bg-blue-500/20 text-blue-300',
    emoji: '👗',
    shortDesc: 'Runway • Studio • Gallery • Street • Boutique',
  },
  'natural-beauty': {
    // All 8 position IDs for preview images
    positions: [
      'yoga-pose', 'forest-stretching', 'lake-lying', 'mountain-arms-up',
      'beach-walking-water', 'garden-sitting-floor', 'reading-lying', 'sunrise-stretch'
    ],
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-400',
    shadowColor: 'shadow-emerald-500/20',
    iconBg: 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30',
    badgeColor: 'bg-emerald-500/20 text-emerald-300',
    emoji: '🧘',
    shortDesc: 'Yoga • Nature • Garden • Beach • Reading',
  },
};

export function ProfilePictureSetSelector({
  selectedSetId,
  onSelect,
  creditCost,
}: ProfilePictureSetSelectorProps) {
  const [hoveredSet, setHoveredSet] = React.useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-purple-400">
              <path
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold">Profile Picture Set</h3>
        </div>
        <p className="text-white/50 text-sm">
          Choose a style theme for your character's profile pictures. Each set generates 7-10 unique shots in different scenes.
        </p>
      </div>

      {/* Skip Option */}
      <label
        className={cn(
          'relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer mb-4 group',
          selectedSetId === null
            ? 'border-purple-400 bg-gradient-to-r from-purple-500/15 to-pink-500/10 shadow-lg shadow-purple-500/10'
            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
        )}
      >
        <input
          type="radio"
          name="profilePictureSet"
          value=""
          checked={selectedSetId === null}
          onChange={() => onSelect(null)}
          className="sr-only"
        />
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all',
          selectedSetId === null
            ? 'bg-purple-500/20'
            : 'bg-white/5 group-hover:bg-white/10'
        )}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={cn(
              'w-6 h-6 transition-colors',
              selectedSetId === null ? 'text-purple-400' : 'text-white/40 group-hover:text-white/60'
            )}
          >
            <path
              d="M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              'font-semibold',
              selectedSetId === null ? 'text-white' : 'text-white/80'
            )}>
              Generate Later
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              Free
            </span>
          </div>
          <p className="text-white/40 text-sm mt-0.5">
            Skip for now and generate profile pictures anytime from your character page
          </p>
        </div>
        {selectedSetId === null && (
          <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-purple-400 ring-4 ring-purple-400/20" />
        )}
      </label>

      {/* Set Options */}
      <div className="space-y-3">
        {profilePictureSets.map((set) => {
          const config = setConfigs[set.id as keyof typeof setConfigs];
          const isSelected = selectedSetId === set.id;
          const isHovered = hoveredSet === set.id;

          return (
            <label
              key={set.id}
              className={cn(
                'relative block rounded-xl border-2 transition-all cursor-pointer overflow-hidden group',
                isSelected
                  ? `${config.borderColor} bg-gradient-to-r ${config.bgGradient} shadow-lg ${config.shadowColor}`
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
              )}
              onMouseEnter={() => setHoveredSet(set.id)}
              onMouseLeave={() => setHoveredSet(null)}
            >
              <input
                type="radio"
                name="profilePictureSet"
                value={set.id}
                checked={isSelected}
                onChange={() => onSelect(set.id)}
                className="sr-only"
              />

              {/* Main Content */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all text-2xl',
                    isSelected ? config.iconBg : 'bg-white/5 group-hover:bg-white/10'
                  )}>
                    {config.emoji}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'font-semibold',
                          isSelected ? 'text-white' : 'text-white/80'
                        )}>
                          {set.name}
                        </p>
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
                          isSelected ? config.badgeColor : 'bg-white/10 text-white/50'
                        )}>
                          +{creditCost}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
                      )}
                    </div>
                    <p className="text-white/50 text-sm mt-1">
                      {config.shortDesc}
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      {set.positions.length} unique photos in different locations
                    </p>
                  </div>
                </div>
              </div>

              {/* Position Preview Grid */}
              <div className={cn(
                'relative overflow-hidden transition-all duration-300',
                isSelected || isHovered ? 'opacity-100' : 'max-h-0 opacity-0'
              )}>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2 px-4 pb-4">
                  {config.positions.map((positionId, idx) => {
                    // Use generated pose preview images
                    const imageSrc = `/profile-sets/${set.id}/${positionId}.webp`;
                    const label = positionId.replace(/-/g, ' ');
                    
                    return (
                      <div
                        key={positionId}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ring-1 ring-white/10 hover:ring-2 hover:ring-white/30',
                          isSelected || isHovered
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                        )}
                        style={{ transitionDelay: `${Math.min(idx, 4) * 40}ms` }}
                      >
                        <Image
                          src={imageSrc}
                          alt={label}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 100px"
                        />
                        {/* Label overlay */}
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                          <span className="text-white text-[9px] sm:text-[10px] font-medium w-full text-center pb-1 capitalize leading-tight px-0.5 truncate">
                            {label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gradient accent line at bottom when selected */}
              {isSelected && (
                <div className={cn(
                  'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r',
                  config.gradient
                )} />
              )}
            </label>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-purple-400/60 shrink-0 mt-0.5">
          <path
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-white/40 text-xs leading-relaxed">
          Profile pictures are generated in the background after character creation. You'll see them appear on your character's profile within a few minutes.
        </p>
      </div>
    </div>
  );
}

