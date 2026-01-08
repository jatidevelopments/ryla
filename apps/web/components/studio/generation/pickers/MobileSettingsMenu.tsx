'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { PickerDrawer } from './PickerDrawer';
import { Shirt, UserCircle2, Sparkles, ChevronRight } from 'lucide-react';

interface MobileSettingsMenuProps {
  onShowPosePicker: () => void;
  onShowOutfitPicker: () => void;
  onShowStylePicker: () => void;
  onShowModelPicker: () => void;
  onShowAspectRatioPicker: () => void;
  onShowCharacterPicker: () => void;
  onClose: () => void;
  selectedCharacterName?: string;
  selectedPoseName?: string;
  outfitDisplayText?: string;
  selectedModelName?: string;
  currentAspectRatio?: string;
  // NSFW props
  studioNsfwEnabled: boolean;
  canEnableNSFW: boolean;
  setStudioNsfwEnabled: (enabled: boolean) => void;
}

export function MobileSettingsMenu({
  onShowPosePicker,
  onShowOutfitPicker,
  onShowStylePicker,
  onShowModelPicker,
  onShowAspectRatioPicker,
  onShowCharacterPicker,
  onClose,
  selectedCharacterName = 'None',
  selectedPoseName = 'None',
  outfitDisplayText = 'None',
  selectedModelName = 'None',
  currentAspectRatio = '1:1',
  studioNsfwEnabled,
  canEnableNSFW,
  setStudioNsfwEnabled,
}: MobileSettingsMenuProps) {
  const options = [
    {
      id: 'character',
      title: 'Character',
      description: selectedCharacterName,
      icon: <UserCircle2 className="w-6 h-6 text-orange-400" />,
      onClick: () => {
        onShowCharacterPicker();
        onClose();
      },
    },
    {
      id: 'model',

      title: 'AI Model',
      description: selectedModelName,
      icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
      onClick: () => {
        onShowModelPicker();
        onClose();
      },
    },
    {
      id: 'aspect-ratio',
      title: 'Aspect Ratio',
      description: currentAspectRatio,
      icon: (
        <div className="w-6 h-6 border-2 border-blue-400 rounded-sm flex items-center justify-center text-[10px] font-bold text-blue-400">
          {currentAspectRatio}
        </div>
      ),
      onClick: () => {
        onShowAspectRatioPicker();
        onClose();
      },
    },
    {
      id: 'pose',
      title: 'Pose',
      description: selectedPoseName,
      icon: <UserCircle2 className="w-6 h-6 text-blue-400" />,
      onClick: () => {
        onShowPosePicker();
        onClose();
      },
    },
    {
      id: 'outfit',
      title: 'Outfit',
      description: outfitDisplayText,
      icon: <Shirt className="w-6 h-6 text-purple-400" />,
      onClick: () => {
        onShowOutfitPicker();
        onClose();
      },
    },
    {
      id: 'style',
      title: 'Styles & Scenes',
      description: 'Customize look',
      icon: <Sparkles className="w-6 h-6 text-pink-400" />,
      onClick: () => {
        onShowStylePicker();
        onClose();
      },
    },
  ];

  return (
    <PickerDrawer isOpen={true} onClose={onClose} title="Generation Settings">
      <div className="p-4 space-y-3">
        {/* NSFW Toggle Section */}
        {canEnableNSFW && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-red-500 font-bold text-xs">18+</span>
              </div>
              <div>
                <div className="font-bold text-white text-lg">
                  Adult Content
                </div>
                <div className="text-sm text-white/50">
                  Enable NSFW generations
                </div>
              </div>
            </div>
            <button
              onClick={() => setStudioNsfwEnabled(!studioNsfwEnabled)}
              className={cn(
                'relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none',
                studioNsfwEnabled ? 'bg-red-600' : 'bg-white/10'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                  studioNsfwEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        )}

        {options.map((option) => (
          <button
            key={option.id}
            onClick={option.onClick}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
              {option.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg">{option.title}</div>
              <div className="text-sm text-white/50">{option.description}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20" />
          </button>
        ))}
      </div>
    </PickerDrawer>
  );
}
