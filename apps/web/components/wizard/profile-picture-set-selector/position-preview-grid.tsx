'use client';

import Image from 'next/image';
import { cn } from '@ryla/ui';

interface PositionPreviewGridProps {
  positions: readonly string[];
  setId: string;
  isVisible: boolean;
}

export function PositionPreviewGrid({
  positions,
  setId,
  isVisible,
}: PositionPreviewGridProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isVisible ? 'opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2 px-4 pb-4">
        {positions.map((positionId, idx) => {
          // Use generated pose preview images
          const imageSrc = `/profile-sets/${setId}/${positionId}.webp`;
          const label = positionId.replace(/-/g, ' ');

          return (
            <div
              key={positionId}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ring-1 ring-white/10 hover:ring-2 hover:ring-white/30',
                isVisible
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
  );
}
