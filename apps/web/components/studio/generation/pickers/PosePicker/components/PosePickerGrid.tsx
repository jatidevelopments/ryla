'use client';

import { cn } from '@ryla/ui';

import { PoseCard } from './PoseCard';
import type { Pose } from '../../../types';

interface PosePickerGridProps {
  availablePoses: Pose[];
  selectedPoseId: string | null;
  onPoseSelect: (id: string | null) => void;
  isFavorited: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export function PosePickerGrid({
  availablePoses,
  selectedPoseId,
  onPoseSelect,
  isFavorited,
  onToggleFavorite,
}: PosePickerGridProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 sm:gap-3">
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
              onToggleFavorite(pose.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
