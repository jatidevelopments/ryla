'use client';

import { X, Star } from 'lucide-react';
import type { OutfitPreset } from '../../../../../lib/api/outfit-presets';

interface OutfitPickerHeaderProps {
  presets: OutfitPreset[];
  influencerId?: string;
  onLoadPreset: (preset: OutfitPreset) => void;
  onClose: () => void;
}

export function OutfitPickerHeader({
  presets,
  influencerId,
  onLoadPreset,
  onClose,
}: OutfitPickerHeaderProps) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-white/10">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white mb-1">Compose Outfit</h2>
        <p className="text-sm text-white/60">
          Select pieces from different categories to create your outfit
        </p>
      </div>

      {/* Quick Access to Saved Presets */}
      {influencerId && presets.length > 0 && (
        <div className="flex items-center gap-2 mr-4">
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <select
              value=""
              onChange={(e) => {
                const presetId = e.target.value;
                if (presetId) {
                  const preset = presets.find((p) => p.id === presetId);
                  if (preset) {
                    onLoadPreset(preset);
                  }
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">Load preset...</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} {preset.isDefault && '⭐'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="flex items-center justify-center h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

