'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@ryla/ui';
import { PlatformBadge, PlatformBadgeGroup } from '@ryla/ui';
import { PLATFORMS, isAspectRatioSupportedByPlatform } from '@ryla/shared';
import type { AspectRatio } from './types';
import type { PlatformId } from '@ryla/shared';

interface AspectRatioOption {
  value: AspectRatio;
  label: string;
  icon: 'square' | 'portrait' | 'landscape';
}

interface AspectRatioPickerProps {
  ratios: AspectRatioOption[];
  selectedRatio: AspectRatio;
  selectedRatios?: AspectRatio[]; // For multiple selection mode
  multiple?: boolean; // Enable multiple selection
  placement?: 'top' | 'bottom'; // Position relative to anchor: 'top' = above, 'bottom' = below
  onSelect: (ratio: AspectRatio) => void;
  onSelectMultiple?: (ratios: AspectRatio[]) => void; // For multiple selection mode
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function AspectRatioPicker({
  ratios,
  selectedRatio,
  selectedRatios = [],
  multiple = false,
  placement = 'bottom',
  onSelect,
  onSelectMultiple,
  onClose,
  anchorRef,
}: AspectRatioPickerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  // Get all unique platforms from all ratios
  const allPlatforms = React.useMemo(() => {
    const platformSet = new Set<PlatformId>();
    ratios.forEach(ratio => {
      ratio.platforms?.forEach(platformId => platformSet.add(platformId));
    });
    return Array.from(platformSet);
  }, [ratios]);

  // Load from localStorage on mount
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<PlatformId[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('ryla-aspect-ratio-platform-filter');
      if (stored) {
        const parsed = JSON.parse(stored) as PlatformId[];
        // Compute available platforms for validation
        const platformSet = new Set<PlatformId>();
        ratios.forEach(ratio => {
          ratio.platforms?.forEach(platformId => platformSet.add(platformId));
        });
        const availablePlatforms = Array.from(platformSet);
        // Validate that all stored platforms are still valid
        return parsed.filter(id => availablePlatforms.includes(id));
      }
    } catch (error) {
      console.warn('Failed to load platform filter from localStorage:', error);
    }
    return [];
  });

  // Save to localStorage whenever selection changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (selectedPlatforms.length === 0) {
        localStorage.removeItem('ryla-aspect-ratio-platform-filter');
      } else {
        localStorage.setItem('ryla-aspect-ratio-platform-filter', JSON.stringify(selectedPlatforms));
      }
    } catch (error) {
      console.warn('Failed to save platform filter to localStorage:', error);
    }
  }, [selectedPlatforms]);

  // Filter and sort ratios based on selected platforms
  const filteredAndSortedRatios = React.useMemo(() => {
    if (selectedPlatforms.length === 0) {
      return ratios;
    }

    // Show ratios that support ANY of the selected platforms
    return ratios.filter(ratio => 
      ratio.platforms?.some(platformId => selectedPlatforms.includes(platformId))
    );
  }, [ratios, selectedPlatforms]);

  const togglePlatform = (platformId: PlatformId) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId);
      }
      return [...prev, platformId];
    });
  };

  const handleAllClick = () => {
    setSelectedPlatforms([]);
  };

  // Calculate position based on anchor element
  React.useEffect(() => {
    setMounted(true);
    
    const updatePosition = () => {
      if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          top: placement === 'top' ? rect.top - 8 : rect.bottom + 8,
          left: rect.left,
        });
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, placement]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!mounted) return null;

  const content = (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: placement === 'top' ? 'translateY(-100%)' : undefined,
      }}
      className="w-80 rounded-xl border border-white/10 bg-[#1a1a1d] p-2 shadow-xl z-[9999]"
    >
      <div className="mb-2 px-2">
        <div className="mb-2 text-xs font-medium text-white/50 uppercase tracking-wider">
          Aspect ratio
        </div>
        {/* Platform filter with full names */}
        {allPlatforms.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-white/50 mb-2 font-medium">Filter by platform</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={handleAllClick}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5',
                  selectedPlatforms.length === 0
                    ? 'bg-[var(--purple-500)]/30 text-white border border-[var(--purple-500)]/50 shadow-sm'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                )}
              >
                <span>All</span>
              </button>
              {allPlatforms.map((platformId) => {
                const platform = PLATFORMS[platformId];
                const isSelected = selectedPlatforms.includes(platformId);
                return (
                  <button
                    key={platformId}
                    onClick={() => togglePlatform(platformId)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 relative',
                      isSelected
                        ? 'bg-[var(--purple-500)]/30 text-white border border-[var(--purple-500)]/50 shadow-sm'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    )}
                  >
                    <PlatformBadge
                      platformId={platformId}
                      size="sm"
                      variant="compact"
                      showLabel={false}
                    />
                    <span className="truncate">{platform.name}</span>
                    {isSelected && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor" 
                        className="absolute top-0.5 right-0.5 h-3 w-3 text-[var(--purple-400)]"
                      >
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        {filteredAndSortedRatios.length === 0 && selectedPlatforms.length > 0 ? (
          <div className="px-3 py-4 text-center text-sm text-white/40">
            No aspect ratios support the selected platform(s)
          </div>
        ) : (
          filteredAndSortedRatios.map((ratio) => {
            const isSelected = multiple 
              ? selectedRatios.includes(ratio.value)
              : selectedRatio === ratio.value;
            
            const handleClick = () => {
              if (multiple && onSelectMultiple) {
                // Toggle selection
                const newRatios = isSelected
                  ? selectedRatios.filter(r => r !== ratio.value)
                  : [...selectedRatios, ratio.value];
                onSelectMultiple(newRatios);
              } else {
                onSelect(ratio.value);
              }
            };

            return (
              <button
                key={ratio.value}
                onClick={handleClick}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isSelected
                    ? 'bg-[var(--purple-500)]/20 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <div className="flex h-5 w-5 items-center justify-center flex-shrink-0">
                  {ratio.icon === 'portrait' && (
                    <div className="h-5 w-3 border border-current rounded-sm" />
                  )}
                  {ratio.icon === 'landscape' && (
                    <div className="h-3 w-5 border border-current rounded-sm" />
                  )}
                  {ratio.icon === 'square' && (
                    <div className="h-4 w-4 border border-current rounded-sm" />
                  )}
                </div>
                <span className="flex-1 text-left font-medium">{ratio.label}</span>
                {/* Platform badges - icons on the same line */}
                {ratio.platforms && ratio.platforms.length > 0 && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {ratio.platforms.map((pid) => (
                      <PlatformBadge
                        key={pid}
                        platformId={pid}
                        size="sm"
                        variant="compact"
                        showLabel={false}
                      />
                    ))}
                  </div>
                )}
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)] flex-shrink-0">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
