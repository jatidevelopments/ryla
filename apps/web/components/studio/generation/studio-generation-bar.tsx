'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, Button } from '@ryla/ui';
import type { GenerationSettings, AspectRatio, Quality, AIModel, VisualStyle, Scene, LightingSetting } from './types';
import { DEFAULT_GENERATION_SETTINGS, AI_MODELS, ASPECT_RATIOS, QUALITY_OPTIONS } from './types';
import { AspectRatioPicker } from './aspect-ratio-picker';
import { QualityPicker } from './quality-picker';
import { ModelPicker } from './model-picker';
import { CharacterPicker } from './character-picker';
import { StylePicker } from './style-picker';
import { Tooltip } from '../../ui/tooltip';
import { useLocalStorage } from '../../../lib/hooks/use-local-storage';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface StudioGenerationBarProps {
  influencers: Influencer[];
  selectedInfluencer: Influencer | null;
  onGenerate: (settings: GenerationSettings) => void;
  isGenerating?: boolean;
  creditsAvailable?: number;
  className?: string;
}

export function StudioGenerationBar({
  influencers,
  selectedInfluencer,
  onGenerate,
  isGenerating = false,
  creditsAvailable = 250,
  className,
}: StudioGenerationBarProps) {
  // Load settings from localStorage (excluding prompt and influencerId which are context-specific)
  const [persistedSettings, setPersistedSettings] = useLocalStorage<Omit<GenerationSettings, 'prompt' | 'influencerId'>>(
    'ryla-studio-generation-settings',
    {
      aspectRatio: DEFAULT_GENERATION_SETTINGS.aspectRatio,
      quality: DEFAULT_GENERATION_SETTINGS.quality,
      modelId: DEFAULT_GENERATION_SETTINGS.modelId,
      styleId: DEFAULT_GENERATION_SETTINGS.styleId,
      sceneId: DEFAULT_GENERATION_SETTINGS.sceneId,
      lightingId: DEFAULT_GENERATION_SETTINGS.lightingId,
      promptEnhance: DEFAULT_GENERATION_SETTINGS.promptEnhance,
      batchSize: DEFAULT_GENERATION_SETTINGS.batchSize,
    }
  );

  const [settings, setSettings] = React.useState<GenerationSettings>(() => ({
    ...persistedSettings,
    prompt: '', // Always start with empty prompt
    influencerId: selectedInfluencer?.id || null,
  }));

  // Picker states
  const [showModelPicker, setShowModelPicker] = React.useState(false);
  const [showAspectRatioPicker, setShowAspectRatioPicker] = React.useState(false);
  const [showQualityPicker, setShowQualityPicker] = React.useState(false);
  const [showCharacterPicker, setShowCharacterPicker] = React.useState(false);
  const [showStylePicker, setShowStylePicker] = React.useState(false);

  // Button refs for picker positioning
  const modelButtonRef = React.useRef<HTMLButtonElement>(null);
  const aspectRatioButtonRef = React.useRef<HTMLButtonElement>(null);
  const qualityButtonRef = React.useRef<HTMLButtonElement>(null);

  // Update influencer when prop changes
  React.useEffect(() => {
    setSettings(prev => ({
      ...prev,
      influencerId: selectedInfluencer?.id || null,
    }));
  }, [selectedInfluencer]);

  // Sync persisted settings when they change externally
  React.useEffect(() => {
    setSettings(prev => ({
      ...prev,
      ...persistedSettings,
      prompt: prev.prompt, // Keep current prompt
      influencerId: prev.influencerId, // Keep current influencer
    }));
  }, [persistedSettings]);

  const selectedModel = AI_MODELS.find(m => m.id === settings.modelId) || AI_MODELS[0];
  const selectedQuality = QUALITY_OPTIONS.find(q => q.value === settings.quality) || QUALITY_OPTIONS[0];
  const creditsCost = selectedQuality.credits * settings.batchSize;

  const handleGenerate = () => {
    if (!settings.influencerId || !settings.prompt.trim()) return;
    onGenerate(settings);
  };

  const updateSetting = <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      
      // Persist to localStorage (excluding prompt and influencerId)
      if (key !== 'prompt' && key !== 'influencerId') {
        setPersistedSettings(prevPersisted => ({
          ...prevPersisted,
          [key]: value,
        }));
      }
      
      return updated;
    });
  };

  const canGenerate = settings.influencerId && settings.prompt.trim() && creditsAvailable >= creditsCost;

  return (
    <div className={cn('mx-4 mb-4 lg:mx-6 lg:mb-6 rounded-2xl bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40', className)}>
      {/* Prompt Input Row */}
      <div className="flex items-center gap-3 px-5 py-4">
        {/* Upload Button */}
        <button className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </button>

        {/* Prompt Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={settings.prompt}
            onChange={(e) => updateSetting('prompt', e.target.value)}
            placeholder="Upload image as a prompt or Describe the scene you imagine"
            className="w-full h-11 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none"
          />
        </div>

        {/* Selected Influencer Thumbnails */}
        <div className="flex items-center gap-2">
          {influencers.slice(0, 3).map((inf) => (
            <button
              key={inf.id}
              onClick={() => {
                updateSetting('influencerId', inf.id);
                setShowCharacterPicker(false);
              }}
              className={cn(
                'relative h-10 w-10 rounded-lg overflow-hidden border-2 transition-all',
                settings.influencerId === inf.id
                  ? 'border-[var(--purple-500)] ring-1 ring-[var(--purple-500)]/50'
                  : 'border-transparent hover:border-white/30'
              )}
            >
              {inf.avatar ? (
                <Image
                  src={inf.avatar}
                  alt={inf.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] flex items-center justify-center text-white text-xs font-bold">
                  {inf.name.charAt(0)}
                </div>
              )}
              {settings.influencerId === inf.id && (
                <div className="absolute bottom-0.5 left-0.5 text-[8px] font-bold text-white bg-black/50 px-1 rounded uppercase truncate max-w-[36px]">
                  {inf.name}
                </div>
              )}
            </button>
          ))}
          
          {/* More Characters Button */}
          <button
            onClick={() => setShowCharacterPicker(true)}
            className="h-11 px-4 rounded-xl bg-white/5 text-[var(--text-secondary)] text-xs font-medium hover:bg-white/10 hover:text-[var(--text-primary)] transition-all"
          >
            More...
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={cn(
            'h-12 px-8 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all',
            canGenerate
              ? 'bg-gradient-to-r from-[var(--purple-500)] to-[var(--purple-600)] text-white hover:from-[var(--purple-400)] hover:to-[var(--purple-500)] shadow-lg shadow-[var(--purple-500)]/25'
              : 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed'
          )}
        >
          <>
            Generate
            <span className="flex items-center gap-0.5 text-xs opacity-80">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.088-2.046.44-.312.978-.53 1.662-.622V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
              </svg>
              {creditsCost.toFixed(2)}
            </span>
          </>
        </button>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-white/5 overflow-x-auto scroll-hidden">
        {/* Model Selector */}
        <div className="relative">
          <Tooltip content="AI Model: Choose the AI model for generation. Different models offer unique styles and quality levels.">
            <button
              ref={modelButtonRef}
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/5 text-[var(--text-primary)] text-sm font-medium hover:bg-white/10 transition-all"
            >
              <ModelIcon model={selectedModel} className="h-4 w-4 text-[var(--purple-400)]" />
              <span>{selectedModel.name.replace('RYLA ', '')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--text-muted)]">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </Tooltip>
          {showModelPicker && (
            <ModelPicker
              models={AI_MODELS}
              selectedModelId={settings.modelId}
              onSelect={(id) => {
                updateSetting('modelId', id);
                setShowModelPicker(false);
              }}
              onClose={() => setShowModelPicker(false)}
              anchorRef={modelButtonRef}
            />
          )}
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-white/10" />

        {/* Aspect Ratio */}
        <div className="relative">
          <Tooltip content="Aspect Ratio: Set the dimensions of generated images. 1:1 for square, 9:16 for stories, 16:9 for landscape.">
            <button
              ref={aspectRatioButtonRef}
              onClick={() => setShowAspectRatioPicker(!showAspectRatioPicker)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/5 text-[var(--text-primary)] text-sm font-medium hover:bg-white/10 transition-all"
            >
              <AspectRatioIcon ratio={settings.aspectRatio} className="h-4 w-4" />
              <span>{settings.aspectRatio}</span>
            </button>
          </Tooltip>
          {showAspectRatioPicker && (
            <AspectRatioPicker
              ratios={ASPECT_RATIOS}
              selectedRatio={settings.aspectRatio}
              placement="top"
              onSelect={(ratio) => {
                updateSetting('aspectRatio', ratio);
                setShowAspectRatioPicker(false);
              }}
              onClose={() => setShowAspectRatioPicker(false)}
              anchorRef={aspectRatioButtonRef}
            />
          )}
        </div>

        {/* Quality */}
        <div className="relative">
          <Tooltip content="Quality: Higher resolution produces sharper images but uses more credits. 1k is fast, 2k is high-quality.">
            <button
              ref={qualityButtonRef}
              onClick={() => setShowQualityPicker(!showQualityPicker)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/5 text-[var(--text-primary)] text-sm font-medium hover:bg-white/10 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)]">
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
              </svg>
              <span>{settings.quality}</span>
            </button>
          </Tooltip>
          {showQualityPicker && (
            <QualityPicker
              options={QUALITY_OPTIONS}
              selectedQuality={settings.quality}
              onSelect={(quality) => {
                updateSetting('quality', quality);
                setShowQualityPicker(false);
              }}
              onClose={() => setShowQualityPicker(false)}
              anchorRef={qualityButtonRef}
            />
          )}
        </div>

        {/* Prompt Enhance Toggle */}
        <Tooltip content="Prompt Enhance: Uses AI to improve your prompt, adding more detail and creativity for better generation results.">
          <button
            onClick={() => updateSetting('promptEnhance', !settings.promptEnhance)}
            className={cn(
              'flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-all',
              settings.promptEnhance
                ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)]'
                : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
            </svg>
            <span>{settings.promptEnhance ? 'On' : 'Off'}</span>
          </button>
        </Tooltip>

        {/* Divider */}
        <div className="h-4 w-px bg-white/10" />

        {/* Batch Size */}
        <Tooltip content="Batch Size: Generate multiple images at once. Higher batch = more credits used per generation.">
          <div className="flex items-center gap-1 h-9 px-1.5 rounded-lg bg-white/5">
            <button
              onClick={() => updateSetting('batchSize', Math.max(1, settings.batchSize - 1))}
              disabled={settings.batchSize <= 1}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="min-w-[36px] text-center text-sm font-medium text-[var(--text-primary)]">
              {settings.batchSize}/4
            </span>
            <button
              onClick={() => updateSetting('batchSize', Math.min(4, settings.batchSize + 1))}
              disabled={settings.batchSize >= 4}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </button>
          </div>
        </Tooltip>

        {/* Visual Styles Button */}
        <Tooltip content="Styles & Scenes: Apply visual styles, backgrounds, and lighting to customize your generated images.">
          <button
            onClick={() => setShowStylePicker(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[var(--purple-500)]/15 text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--purple-500)]/25 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)]">
              <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
            <span>Styles & Scenes</span>
          </button>
        </Tooltip>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Credits Display */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span>Credits:</span>
          <span className="font-bold text-[var(--text-primary)]">{creditsAvailable}</span>
        </div>
      </div>

      {/* Character Picker Modal */}
      {showCharacterPicker && (
        <CharacterPicker
          influencers={influencers}
          selectedInfluencerId={settings.influencerId}
          onSelect={(id) => {
            updateSetting('influencerId', id);
            setShowCharacterPicker(false);
          }}
          onClose={() => setShowCharacterPicker(false)}
        />
      )}

      {/* Style Picker Modal */}
      {showStylePicker && (
        <StylePicker
          selectedStyleId={settings.styleId}
          selectedSceneId={settings.sceneId}
          selectedLightingId={settings.lightingId}
          onStyleSelect={(id) => updateSetting('styleId', id)}
          onSceneSelect={(id) => updateSetting('sceneId', id)}
          onLightingSelect={(id) => updateSetting('lightingId', id)}
          onClose={() => setShowStylePicker(false)}
        />
      )}
    </div>
  );
}

// Helper Components
function ModelIcon({ model, className }: { model: AIModel; className?: string }) {
  // Different icons based on model type
  const iconClass = cn('shrink-0', className);
  
  switch (model.icon) {
    case 'soul':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      );
    case 'flux':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" />
        </svg>
      );
  }
}

function AspectRatioIcon({ ratio, className }: { ratio: AspectRatio; className?: string }) {
  const ratioConfig = ASPECT_RATIOS.find(r => r.value === ratio);
  const iconClass = cn('shrink-0', className);
  
  if (ratioConfig?.icon === 'portrait') {
    return <div className={cn(iconClass, 'h-4 w-2.5 border border-current rounded-sm')} />;
  }
  if (ratioConfig?.icon === 'landscape') {
    return <div className={cn(iconClass, 'h-2.5 w-4 border border-current rounded-sm')} />;
  }
  return <div className={cn(iconClass, 'h-3 w-3 border border-current rounded-sm')} />;
}

