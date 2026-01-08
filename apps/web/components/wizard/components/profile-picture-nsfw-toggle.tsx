'use client';

import { Checkbox } from '@ryla/ui';

interface ProfilePictureNSFWToggleProps {
  nsfwEnabled: boolean;
  onNSFWChange: (enabled: boolean) => void;
}

export function ProfilePictureNSFWToggle({
  nsfwEnabled,
  onNSFWChange,
}: ProfilePictureNSFWToggleProps) {
  return (
    <div className="w-full mb-4">
      <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Checkbox
            id="nsfw-toggle-profile"
            checked={nsfwEnabled || false}
            onCheckedChange={(checked) => onNSFWChange(checked as boolean)}
          />
          <label
            htmlFor="nsfw-toggle-profile"
            className="text-white/70 text-sm font-medium leading-relaxed cursor-pointer flex-1"
          >
            Enable NSFW Content
          </label>
        </div>
        <p className="text-white/40 text-xs mt-2 ml-7">
          When enabled, profile pictures will include 3 adult-themed images
        </p>
      </div>
    </div>
  );
}
