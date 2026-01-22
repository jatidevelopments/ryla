'use client';

import { Switch, cn } from '@ryla/ui';
import { useSubscription } from '../../../lib/hooks/use-subscription';

interface GenerationSettingsProps {
  aspectRatio: string;
  nsfwEnabled: boolean;
  onAspectRatioChange: (ratio: '1:1' | '9:16' | '2:3') => void;
  onNsfwChange: (checked: boolean) => void;
}

export function GenerationSettings({
  aspectRatio,
  nsfwEnabled,
  onAspectRatioChange,
  onNsfwChange,
}: GenerationSettingsProps) {
  const { isPro } = useSubscription();
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

        {/* NSFW - Only show for Pro users */}
        {isPro && (
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm font-medium">18+ Content</p>
              <p className="text-white/40 text-xs">Enable NSFW content</p>
            </div>
            <Switch checked={nsfwEnabled} onCheckedChange={onNsfwChange} />
          </div>
        )}
      </div>
    </div>
  );
}

