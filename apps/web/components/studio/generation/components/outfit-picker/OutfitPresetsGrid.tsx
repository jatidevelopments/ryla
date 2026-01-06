'use client';

import { Star, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@ryla/ui';
import type { OutfitPreset } from '../../../../../lib/api/outfit-presets';

interface OutfitPresetsGridProps {
  presets: OutfitPreset[];
  isLoading: boolean;
  onLoadPreset: (preset: OutfitPreset) => void;
  onEditPreset: (preset: OutfitPreset) => void;
  onDeletePreset: (id: string) => void;
}

export function OutfitPresetsGrid({
  presets,
  isLoading,
  onLoadPreset,
  onEditPreset,
  onDeletePreset,
}: OutfitPresetsGridProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40 text-sm">Loading presets...</p>
      </div>
    );
  }

  if (presets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⭐</div>
        <p className="text-white/60 text-sm mb-2">No saved presets yet</p>
        <p className="text-white/40 text-xs">Compose an outfit and save it as a preset</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {presets.map((preset) => {
        const presetPieces = [
          preset.composition.top,
          preset.composition.bottom,
          preset.composition.shoes,
        ].filter(Boolean).length;

        return (
          <button
            key={preset.id}
            onClick={() => onLoadPreset(preset)}
            className={cn(
              'group relative rounded-xl overflow-hidden border-2 transition-all bg-gradient-to-br from-white/5 to-white/[0.02] text-left p-4',
              'hover:border-white/30'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{preset.name}</h3>
                  {preset.isDefault && (
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                {preset.description && (
                  <p className="text-xs text-white/50 mb-2">{preset.description}</p>
                )}
                <p className="text-xs text-white/40">
                  {presetPieces} piece{presetPieces !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPreset(preset);
                  }}
                  className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400"
                  title="Edit preset"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePreset(preset.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                  title="Delete preset"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

