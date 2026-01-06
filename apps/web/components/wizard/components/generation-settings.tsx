'use client';

import { Switch, cn } from '@ryla/ui';

interface GenerationSettingsProps {
  aspectRatio: string;
  qualityMode: 'hq' | 'draft';
  nsfwEnabled: boolean;
  onAspectRatioChange: (ratio: '1:1' | '9:16' | '2:3') => void;
  onQualityModeChange: (checked: boolean) => void;
  onNsfwChange: (checked: boolean) => void;
}

export function GenerationSettings({
  aspectRatio,
  qualityMode,
  nsfwEnabled,
  onAspectRatioChange,
  onQualityModeChange,
  onNsfwChange,
}: GenerationSettingsProps) {
  return (
    <div className="w-full mb-5">
      <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
        <p className="text-white/70 text-sm">Generation Settings</p>

        {/* Aspect Ratio */}
        <div>
          <p className="text-white/50 text-xs mb-2">Aspect Ratio</p>
          <div className="flex gap-2">
            {(['1:1', '9:16', '2:3'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => onAspectRatioChange(ratio)}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2.5 text-center text-sm transition-all',
                  aspectRatio === ratio
                    ? 'border-purple-400/50 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                )}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Mode */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-white text-sm font-medium">HQ Mode</p>
            <p className="text-white/40 text-xs">Higher quality output</p>
          </div>
          <Switch checked={qualityMode === 'hq'} onCheckedChange={onQualityModeChange} />
        </div>

        {/* NSFW */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-white text-sm font-medium">18+ Content</p>
            <p className="text-white/40 text-xs">Enable adult content</p>
          </div>
          <Switch checked={nsfwEnabled} onCheckedChange={onNsfwChange} />
        </div>
      </div>
    </div>
  );
}

