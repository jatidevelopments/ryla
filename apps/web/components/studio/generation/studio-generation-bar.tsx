'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, Button } from '@ryla/ui';
import type { GenerationSettings, AspectRatio, Quality, AIModel, VisualStyle, Scene, LightingSetting } from './types';
import { DEFAULT_GENERATION_SETTINGS, getAIModelsForMode, ASPECT_RATIOS, QUALITY_OPTIONS } from './types';
import { AspectRatioPicker } from './aspect-ratio-picker';
import { QualityPicker } from './quality-picker';
import { ModelPicker } from './model-picker';
import { CharacterPicker } from './character-picker';
import { StylePicker } from './style-picker';
import { Tooltip } from '../../ui/tooltip';
import { useLocalStorage } from '../../../lib/hooks/use-local-storage';
import type { StudioImage } from '../studio-image-card';
import { ModeSelector, getModeBorderColor } from './mode-selector';
import { PosePicker } from './pose-picker';
import { OutfitCompositionPicker } from './outfit-composition-picker';
import { PreComposedOutfitPicker } from './pre-composed-outfit-picker';
import { OutfitModeSelector, type OutfitMode } from './outfit-mode-selector';
import { ObjectPicker } from './object-picker';
import { ALL_POSES } from './types';
import { OUTFIT_OPTIONS, OutfitComposition, getPieceById } from '@ryla/shared';
import type { StudioMode, ContentType, SelectedObject } from './types';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface StudioGenerationBarProps {
  influencers: Influencer[];
  selectedInfluencer: Influencer | null;
  onInfluencerChange?: (influencerId: string | null) => void; // Callback when influencer changes in bottom toolbar
  onGenerate: (settings: GenerationSettings) => void;
  isGenerating?: boolean;
  creditsAvailable?: number;
  selectedImage?: StudioImage | null;
  onClearSelectedImage?: () => void;
  mode: StudioMode;
  contentType: ContentType;
  onModeChange: (mode: StudioMode) => void;
  onContentTypeChange: (type: ContentType) => void;
  nsfwEnabled: boolean;
  availableImages?: StudioImage[]; // Images available for object selection
  hasUploadConsent?: boolean; // Whether user has accepted upload consent
  onAcceptConsent?: () => Promise<void>; // Handler to accept consent
  onUploadImage?: (file: File) => Promise<StudioImage | null>; // Handler to upload image
  className?: string;
}

export function StudioGenerationBar({
  influencers,
  selectedInfluencer,
  onInfluencerChange,
  onGenerate,
  isGenerating = false,
  creditsAvailable = 250,
  selectedImage = null,
  onClearSelectedImage,
  mode,
  contentType,
  onModeChange,
  onContentTypeChange,
  nsfwEnabled,
  availableImages = [],
  hasUploadConsent = false,
  onAcceptConsent,
  onUploadImage,
  className,
}: StudioGenerationBarProps) {
  // Auto-switch to editing mode when image is selected (but allow manual mode changes)
  React.useEffect(() => {
    if (selectedImage && mode === 'creating') {
      onModeChange('editing');
    }
  }, [selectedImage, mode, onModeChange]);

  // Handle mode changes - clear image when switching to creating mode
  const handleModeChange = React.useCallback((newMode: StudioMode) => {
    // If switching to creating mode and there's a selected image, clear it first
    if (newMode === 'creating' && selectedImage) {
      if (onClearSelectedImage) {
        onClearSelectedImage();
      }
    }
    onModeChange(newMode);
  }, [selectedImage, onClearSelectedImage, onModeChange]);

  // Track the last image ID we loaded settings from to avoid overwriting user edits
  const lastLoadedImageIdRef = React.useRef<string | null>(null);

  // Helper to convert snake_case to kebab-case (for scene/environment mapping)
  const snakeToKebab = (str: string | null | undefined): string | null => {
    if (!str) return null;
    return str.replace(/_/g, '-');
  };

  // Helper to map qualityMode to quality setting
  const mapQualityMode = (qualityMode: string | null | undefined): Quality => {
    if (qualityMode === 'hq') return '2k';
    return '1.5k'; // default to draft/1.5k
  };

  // Load all settings from selected image when entering editing/upscaling/variations mode
  React.useEffect(() => {
    if (selectedImage && (mode === 'editing' || mode === 'upscaling' || mode === 'variations')) {
      // Only load settings if this is a different image than we've already loaded
      if (selectedImage.id !== lastLoadedImageIdRef.current) {
        // Parse outfit - can be string or JSON stringified OutfitComposition
        let outfitValue: string | null | import('@ryla/shared').OutfitComposition = null;
        if (selectedImage.outfit) {
          try {
            // Try to parse as JSON first (new format)
            outfitValue = JSON.parse(selectedImage.outfit);
          } catch {
            // If parsing fails, it's a legacy string format
            outfitValue = selectedImage.outfit;
          }
        }

        setSettings(prev => ({
          ...prev,
          // Don't load prompt - we can't extract just the user's custom input from the full built prompt
          prompt: '', // User can re-enter their custom details
          // Load all other settings from the image
          sceneId: snakeToKebab(selectedImage.scene) || null,
          poseId: selectedImage.poseId || null,
          outfit: outfitValue,
          aspectRatio: selectedImage.aspectRatio || prev.aspectRatio,
          // Note: qualityMode needs to be mapped, but we don't have it in StudioImage
          // We'll keep the current quality setting
        }));
        
        // Load NSFW setting from the selected image
        if (selectedImage.nsfw !== undefined) {
          setStudioNsfwEnabled(selectedImage.nsfw);
        }
        
        lastLoadedImageIdRef.current = selectedImage.id;
      }
    } else if (!selectedImage || mode === 'creating') {
      // Clear prompt when no image is selected or switching to creating mode
      setSettings(prev => ({
        ...prev,
        prompt: '',
      }));
      lastLoadedImageIdRef.current = null;
    }
  }, [selectedImage, mode]);

  // Clear objects when switching away from editing mode
  React.useEffect(() => {
    if (mode !== 'editing' && settings.objects.length > 0) {
      updateSetting('objects', []);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load settings from localStorage (excluding prompt, influencerId, mode, contentType, and objects which are context-specific)
  const [persistedSettings, setPersistedSettings] = useLocalStorage<Omit<GenerationSettings, 'prompt' | 'influencerId' | 'mode' | 'contentType' | 'objects'>>(
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
      poseId: DEFAULT_GENERATION_SETTINGS.poseId,
      outfit: DEFAULT_GENERATION_SETTINGS.outfit,
    }
  );

  const [settings, setSettings] = React.useState<GenerationSettings>(() => ({
    ...persistedSettings,
    prompt: '', // Always start with empty prompt
    influencerId: selectedInfluencer?.id || null,
    mode,
    contentType,
    outfit: persistedSettings.outfit ?? null,
    objects: [], // Always start with empty objects
  }));

  // Picker states
  const [showModelPicker, setShowModelPicker] = React.useState(false);
  const [showAspectRatioPicker, setShowAspectRatioPicker] = React.useState(false);
  const [showQualityPicker, setShowQualityPicker] = React.useState(false);
  const [showCharacterPicker, setShowCharacterPicker] = React.useState(false);
  const [showStylePicker, setShowStylePicker] = React.useState(false);
  const [showPosePicker, setShowPosePicker] = React.useState(false);
  const [showOutfitModeSelector, setShowOutfitModeSelector] = React.useState(false);
  const [showOutfitPicker, setShowOutfitPicker] = React.useState(false);
  const [outfitMode, setOutfitMode] = React.useState<OutfitMode | null>(null);
  const [showObjectPicker, setShowObjectPicker] = React.useState(false);

  // Button refs for picker positioning
  const modelButtonRef = React.useRef<HTMLButtonElement>(null);
  const aspectRatioButtonRef = React.useRef<HTMLButtonElement>(null);
  const qualityButtonRef = React.useRef<HTMLButtonElement>(null);

  // Update influencer when prop changes (sync from top bar)
  React.useEffect(() => {
    setSettings(prev => {
      const newInfluencerId = selectedInfluencer?.id || null;
      // Only update if different to avoid unnecessary re-renders
      if (prev.influencerId !== newInfluencerId) {
        return {
          ...prev,
          influencerId: newInfluencerId,
        };
      }
      return prev;
    });
  }, [selectedInfluencer]);

  // Sync persisted settings when they change externally
  React.useEffect(() => {
    setSettings(prev => ({
      ...prev,
      ...persistedSettings,
      prompt: prev.prompt, // Keep current prompt
      influencerId: prev.influencerId, // Keep current influencer
      mode, // Sync mode
      contentType, // Sync content type
      objects: prev.objects, // Keep current objects
    }));
  }, [persistedSettings, mode, contentType]);

  // Local NSFW toggle state (separate from influencer-level nsfwEnabled)
  const [studioNsfwEnabled, setStudioNsfwEnabled] = React.useState(false);

  // Get models filtered by current mode and NSFW setting
  const availableModels = React.useMemo(() => {
    return getAIModelsForMode(mode, {
      nsfwEnabled: studioNsfwEnabled,
      mvpOnly: true, // Only show MVP models (1-2 per mode)
    });
  }, [mode, studioNsfwEnabled]);

  // Reset modelId if current selection is not available for the mode or NSFW setting
  React.useEffect(() => {
    const isCurrentModelAvailable = availableModels.some(m => m.id === settings.modelId);
    if (!isCurrentModelAvailable && availableModels.length > 0) {
      setSettings(prev => {
        const updated = { ...prev, modelId: availableModels[0].id };
        setPersistedSettings(prevPersisted => ({
          ...prevPersisted,
          modelId: availableModels[0].id,
        }));
        return updated;
      });
    }
  }, [mode, studioNsfwEnabled, availableModels, settings.modelId]);

  // Disable NSFW toggle if influencer doesn't have NSFW enabled
  const canEnableNSFW = nsfwEnabled; // Only if influencer has NSFW enabled

  const selectedModel = availableModels.find(m => m.id === settings.modelId) || availableModels[0] || null;
  const selectedQuality = QUALITY_OPTIONS.find(q => q.value === settings.quality) || QUALITY_OPTIONS[0];
  const creditsCost = selectedQuality.credits * settings.batchSize;
  const selectedPose = settings.poseId ? ALL_POSES.find(p => p.id === settings.poseId) : null;
  
  // Reorder influencers to show selected one first
  const orderedInfluencers = React.useMemo(() => {
    if (!settings.influencerId) {
      return influencers;
    }
    const selected = influencers.find(inf => inf.id === settings.influencerId);
    const others = influencers.filter(inf => inf.id !== settings.influencerId);
    return selected ? [selected, ...others] : influencers;
  }, [influencers, settings.influencerId]);
  
  // Get outfit display text (supports both legacy string and new composition)
  const getOutfitDisplayText = (): string => {
    if (!settings.outfit) return 'Outfit';
    
    // Legacy string format
    if (typeof settings.outfit === 'string') {
      const outfit = OUTFIT_OPTIONS.find(
        (o) => o.label.toLowerCase().replace(/\s+/g, '-') === settings.outfit
      );
      return outfit?.label || 'Outfit';
    }
    
    // New composition format
    const comp = settings.outfit as OutfitComposition;
    const pieces: string[] = [];
    if (comp.top) {
      const piece = getPieceById(comp.top);
      if (piece) pieces.push(piece.label);
    }
    if (comp.bottom) {
      const piece = getPieceById(comp.bottom);
      if (piece) pieces.push(piece.label);
    }
    if (comp.shoes) {
      const piece = getPieceById(comp.shoes);
      if (piece) pieces.push(piece.label);
    }
    if (pieces.length > 0) {
      return pieces.length > 2 ? `${pieces[0]} +${pieces.length - 1}` : pieces.join(' + ');
    }
    return 'Outfit';
  };
  
  const outfitDisplayText = getOutfitDisplayText();
  const hasOutfitComposition = settings.outfit && typeof settings.outfit === 'object';
  const modeBorderColor = getModeBorderColor(mode);

  const handleGenerate = () => {
    // Allow generation without influencer (for "All Images" mode)
    // if (!settings.influencerId) return;
    
    // Validation based on mode
    // Note: prompt is now optional - backend builds it from character DNA and settings
    if ((mode === 'editing' || mode === 'upscaling') && !selectedImage) return;
    
    // If no influencer selected, we can't generate (need at least one)
    if (!settings.influencerId) {
      // Show a message or prevent generation
      return;
    }
    
    const finalSettings = {
      ...settings,
      nsfw: studioNsfwEnabled, // Pass Studio-level NSFW toggle
    };
    onGenerate(finalSettings);
  };

  const updateSetting = <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      
      // Persist to localStorage (excluding prompt, influencerId, mode, contentType, objects)
      if (key !== 'prompt' && key !== 'influencerId' && key !== 'mode' && key !== 'contentType' && key !== 'objects') {
        setPersistedSettings(prevPersisted => ({
          ...prevPersisted,
          [key]: value,
        }));
      }
      
      return updated;
    });
  };

  // Validation based on mode
  // Note: prompt is now optional - backend builds it from character DNA and settings
  const canGenerate = React.useMemo(() => {
    // Require influencer for generation
    if (!settings.influencerId || creditsAvailable < creditsCost) return false;
    
    // Creating mode: no prompt required (backend builds it)
    if (mode === 'creating') {
      return true;
    }
    
    if (mode === 'editing' || mode === 'upscaling') {
      return selectedImage !== null;
    }
    
    return false;
  }, [settings.influencerId, mode, selectedImage, creditsAvailable, creditsCost]);

  // Get button label based on mode
  const getButtonLabel = () => {
    switch (mode) {
      case 'creating':
        return 'Generate';
      case 'editing':
        return 'Edit';
      case 'upscaling':
        return 'Upscale';
      case 'variations':
        return 'Create Variations';
      default:
        return 'Generate';
    }
  };

  // Determine which controls should be visible based on mode
  const showCreativeControls = mode === 'creating' || mode === 'editing';
  const showAspectRatio = mode === 'creating' || mode === 'editing';
  const showPromptEnhance = mode === 'creating' || mode === 'editing';

  return (
    <div className={cn('mx-4 mb-4 lg:mx-6 lg:mb-6', className)}>
      {/* Mode Selector */}
      <ModeSelector
        mode={mode}
        contentType={contentType}
        onModeChange={handleModeChange}
        onContentTypeChange={onContentTypeChange}
        hasSelectedImage={!!selectedImage}
        creditsAvailable={creditsAvailable}
      />
      
      {/* Generation Bar */}
      <div 
        className="rounded-2xl bg-[var(--bg-elevated)]/95 backdrop-blur-xl border-2 shadow-2xl shadow-black/40 transition-colors"
        style={{ borderColor: mode === 'creating' ? '#3b82f6' : mode === 'editing' ? '#a855f7' : mode === 'upscaling' ? '#22c55e' : '#f97316' }}
      >
      {/* Prompt Input Row */}
      <div className="flex items-center gap-3 px-5 py-4">
        {/* Upload Button / Selected Image in Editing Mode */}
        {selectedImage ? (
          <div className="flex items-center gap-2">
            {/* Main Selected Image */}
            <div className="relative group">
              <div className="relative h-11 w-11 rounded-xl overflow-hidden border-2 border-[var(--purple-500)] ring-1 ring-[var(--purple-500)]/50">
                <Image
                  src={selectedImage.thumbnailUrl || selectedImage.imageUrl}
                  alt="Selected image"
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Editing mode indicator */}
                <div className="absolute inset-0 bg-[var(--purple-500)]/20 flex items-center justify-center">
                  <div className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--purple-500)] ring-1 ring-white/50" />
                </div>
              </div>
              {/* Clear button on hover */}
              {onClearSelectedImage && (
                <button
                  onClick={onClearSelectedImage}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-red-600 z-10"
                  title="Clear selection"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Selected Objects (up to 3) */}
            {mode === 'editing' && (
              <div className="flex items-center gap-1.5">
                {settings.objects.slice(0, 3).map((obj, index) => (
                  <div key={obj.id} className="relative group">
                    <div className="relative h-11 w-11 rounded-xl overflow-hidden border-2 border-[var(--purple-400)]/50">
                      <Image
                        src={obj.thumbnailUrl || obj.imageUrl}
                        alt={obj.name || `Object ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    {/* Remove button on hover */}
                    <button
                      onClick={() => {
                        updateSetting('objects', settings.objects.filter(o => o.id !== obj.id));
                      }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-red-600 z-10"
                      title="Remove object"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {/* Add Object Button */}
                {settings.objects.length < 3 && (
                  <button
                    onClick={() => setShowObjectPicker(true)}
                    className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all border-2 border-dashed border-white/20"
                    title="Add object"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <button className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </button>
        )}

        {/* Prompt Input */}
        <div className="flex-1 relative min-w-0">
          <input
            type="text"
            value={settings.prompt}
            onChange={(e) => updateSetting('prompt', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canGenerate && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            disabled={mode === 'upscaling'}
            placeholder={
              mode === 'upscaling' 
                ? "Upscaling doesn't require a prompt..."
                : mode === 'editing'
                ? "Add custom details or describe changes..."
                : mode === 'creating'
                ? "Upload image as a prompt or Describe the scene you imagine"
                : "Describe what you want to generate..."
            }
            className={cn(
              "w-full h-11 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none transition-all",
              "truncate pr-2", // Truncate long text
              mode === 'upscaling' && "opacity-50 cursor-not-allowed"
            )}
            style={{
              maxWidth: '100%',
            }}
          />
        </div>

        {/* Selected Influencer Thumbnails */}
        <div className="flex items-center gap-2">
          {orderedInfluencers.slice(0, 3).map((inf) => (
            <button
              key={inf.id}
              onClick={() => {
                updateSetting('influencerId', inf.id);
                setShowCharacterPicker(false);
                // Sync to top bar
                if (onInfluencerChange) {
                  onInfluencerChange(inf.id);
                }
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
          
          {/* Red cross icon when no influencer is selected */}
          {!selectedInfluencer && (
            <Tooltip content="No influencer selected. Select an influencer to generate images.">
              <div className="relative h-10 w-10 rounded-lg bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-400">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </div>
            </Tooltip>
          )}
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
            {getButtonLabel()}
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
      <div className="flex items-center gap-1.5 px-4 py-2 border-t border-white/5 overflow-x-auto scroll-hidden">
        {/* Model Selector */}
        <div className="relative">
          <Tooltip content="AI Model: Choose the AI model for generation. Different models offer unique styles and quality levels.">
            <button
              ref={modelButtonRef}
              onClick={() => setShowModelPicker(!showModelPicker)}
              disabled={!selectedModel || availableModels.length === 0}
              className="flex items-center gap-1.5 h-8 px-2 rounded-lg bg-white/5 text-[var(--text-primary)] text-xs font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedModel && (
                <>
                  <ModelIcon model={selectedModel} className="h-3.5 w-3.5 text-[var(--purple-400)]" />
                  <span className="truncate max-w-[80px]">{selectedModel.name.replace('RYLA ', '')}</span>
                </>
              )}
              {!selectedModel && <span>No models available</span>}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--text-muted)]">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </Tooltip>
          {showModelPicker && (
            <ModelPicker
              models={availableModels}
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
        <div className="h-3.5 w-px bg-white/10" />

        {/* Aspect Ratio - Only show for creating/editing modes */}
        {showAspectRatio && (
          <div className="relative">
            <Tooltip content="Aspect Ratio: Set the dimensions of generated images. 1:1 for square, 9:16 for stories, 16:9 for landscape.">
              <button
                ref={aspectRatioButtonRef}
                onClick={() => setShowAspectRatioPicker(!showAspectRatioPicker)}
                className="flex items-center gap-1.5 h-8 px-2 rounded-lg bg-white/5 text-[var(--text-primary)] text-xs font-medium hover:bg-white/10 transition-all"
              >
                <AspectRatioIcon ratio={settings.aspectRatio} className="h-3.5 w-3.5" />
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
        )}

        {/* Divider - Show after aspect ratio if visible */}
        {showAspectRatio && <div className="h-3.5 w-px bg-white/10" />}

        {/* Quality */}
        <div className="relative">
          <Tooltip content="Quality: Higher resolution produces sharper images but uses more credits. 1k is fast, 2k is high-quality.">
            <button
              ref={qualityButtonRef}
              onClick={() => setShowQualityPicker(!showQualityPicker)}
              className="flex items-center gap-1.5 h-8 px-2 rounded-lg bg-white/5 text-[var(--text-primary)] text-xs font-medium hover:bg-white/10 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--purple-400)]">
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

        {/* Prompt Enhance Toggle - Only show for creating/editing modes */}
        {showPromptEnhance && (
          <>
            <Tooltip content="Prompt Enhance: Uses AI to improve your prompt, adding more detail and creativity for better generation results.">
              <button
                onClick={() => updateSetting('promptEnhance', !settings.promptEnhance)}
                className={cn(
                  'flex items-center gap-1.5 h-8 px-2 rounded-lg text-xs font-medium transition-all',
                  settings.promptEnhance
                    ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)]'
                    : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
                </svg>
                <span>{settings.promptEnhance ? 'On' : 'Off'}</span>
              </button>
            </Tooltip>

            {/* Divider */}
            <div className="h-3.5 w-px bg-white/10" />
          </>
        )}

        {/* Batch Size */}
        <Tooltip content="Batch Size: Generate multiple images at once. Higher batch = more credits used per generation.">
          <div className="flex items-center gap-1 h-8 px-1 rounded-lg bg-white/5">
            <button
              onClick={() => updateSetting('batchSize', Math.max(1, settings.batchSize - 1))}
              disabled={settings.batchSize <= 1}
              className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="min-w-[32px] text-center text-xs font-medium text-[var(--text-primary)]">
              {settings.batchSize}/4
            </span>
            <button
              onClick={() => updateSetting('batchSize', Math.min(4, settings.batchSize + 1))}
              disabled={settings.batchSize >= 4}
              className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </button>
          </div>
        </Tooltip>

        {/* Creative Controls - Only show for creating/editing modes */}
        {showCreativeControls && (
          <>
            {/* Divider before creative controls */}
            <div className="h-3.5 w-px bg-white/10" />

            {/* Pose Picker Button */}
            <Tooltip content="Pose: Select a pose to add to your prompt. Different poses available based on content settings.">
              <button
                onClick={() => setShowPosePicker(true)}
                className={cn(
                  'flex items-center gap-1.5 h-8 px-2 rounded-lg text-xs font-medium transition-all',
                  selectedPose
                    ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
                    : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--purple-400)]">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 0114 0v1H3v-1zm7-4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" />
                </svg>
                <span className="truncate max-w-[100px]">{selectedPose ? selectedPose.name : 'Pose'}</span>
              </button>
            </Tooltip>

            {/* Outfit Composition Picker Button */}
            <Tooltip content="Outfit: Choose from pre-composed outfits or create your own custom composition.">
              <button
                onClick={() => setShowOutfitModeSelector(true)}
                className={cn(
                  'flex items-center gap-1.5 h-8 px-2 rounded-lg text-xs font-medium transition-all',
                  hasOutfitComposition || (typeof settings.outfit === 'string' && settings.outfit)
                    ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
                    : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--purple-400)]">
                  <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                </svg>
                <span className="truncate max-w-[100px]">{outfitDisplayText}</span>
              </button>
            </Tooltip>

            {/* Visual Styles Button */}
            <Tooltip content="Styles & Scenes: Apply visual styles, backgrounds, and lighting to customize your generated images.">
              <button
                onClick={() => setShowStylePicker(true)}
                className="flex items-center gap-1.5 h-8 px-2 rounded-lg bg-[var(--purple-500)]/15 text-[var(--text-primary)] text-xs font-medium hover:bg-[var(--purple-500)]/25 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--purple-400)]">
                  <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
                <span className="truncate max-w-[120px]">Styles & Scenes</span>
              </button>
            </Tooltip>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Adult Content Toggle */}
        <Tooltip 
          content={
            !canEnableNSFW
              ? "Adult content generation requires enabling 18+ Adult Content in influencer settings."
              : studioNsfwEnabled
              ? "Adult Content: Enabled. Only ComfyUI models (RYLA Soul, RYLA Character) are available. Click to disable."
              : "Adult Content: Disabled. All models available. Click to enable adult content generation (18+)."
          }
        >
          <button
            onClick={() => {
              if (!canEnableNSFW) {
                alert('Adult content generation requires enabling 18+ Adult Content in influencer settings.');
                return;
              }
              setStudioNsfwEnabled(!studioNsfwEnabled);
            }}
            disabled={!canEnableNSFW}
            className={cn(
              'flex items-center gap-1.5 h-8 px-2 rounded-lg text-xs font-medium transition-all',
              !canEnableNSFW
                ? 'bg-white/5 text-[var(--text-muted)] border border-white/10 opacity-60 cursor-not-allowed'
                : studioNsfwEnabled
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-white/5 text-[var(--text-secondary)] border border-white/10 hover:text-[var(--text-primary)] hover:bg-white/10'
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span className="truncate max-w-[120px]">Adult Content {studioNsfwEnabled ? 'On' : 'Off'}</span>
          </button>
        </Tooltip>
      </div>

      {/* Character Picker Modal */}
      {showCharacterPicker && (
        <CharacterPicker
          influencers={influencers}
          selectedInfluencerId={settings.influencerId}
          onSelect={(id) => {
            updateSetting('influencerId', id);
            setShowCharacterPicker(false);
            // Sync to top bar
            if (onInfluencerChange) {
              onInfluencerChange(id);
            }
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

      {/* Pose Picker Modal */}
      {showPosePicker && (
        <PosePicker
          selectedPoseId={settings.poseId}
          onPoseSelect={(id) => updateSetting('poseId', id)}
          onClose={() => setShowPosePicker(false)}
          nsfwEnabled={studioNsfwEnabled}
        />
      )}

      {/* Outfit Mode Selector */}
      {showOutfitModeSelector && (
        <OutfitModeSelector
          onModeSelect={(mode) => {
            setOutfitMode(mode);
            setShowOutfitModeSelector(false);
            setShowOutfitPicker(true);
          }}
          onClose={() => setShowOutfitModeSelector(false)}
        />
      )}

      {/* Pre-Composed Outfit Picker */}
      {showOutfitPicker && outfitMode === 'pre-composed' && (
        <PreComposedOutfitPicker
          selectedOutfit={
            typeof settings.outfit === 'string' ? settings.outfit : null
          }
          onOutfitSelect={(outfit) => {
            updateSetting('outfit', outfit);
            setShowOutfitPicker(false);
            setOutfitMode(null);
          }}
          onClose={() => {
            setShowOutfitPicker(false);
            setOutfitMode(null);
          }}
          nsfwEnabled={studioNsfwEnabled}
        />
      )}

      {/* Custom Composition Picker */}
      {showOutfitPicker && outfitMode === 'custom' && (
        <OutfitCompositionPicker
          selectedComposition={
            typeof settings.outfit === 'object' && settings.outfit !== null
              ? (settings.outfit as OutfitComposition)
              : null
          }
          onCompositionSelect={(composition) => {
            updateSetting('outfit', composition);
            setShowOutfitPicker(false);
            setOutfitMode(null);
          }}
          onClose={() => {
            setShowOutfitPicker(false);
            setOutfitMode(null);
          }}
          nsfwEnabled={studioNsfwEnabled}
          influencerId={settings.influencerId || undefined}
        />
      )}

      {/* Object Picker Modal */}
      {showObjectPicker && mode === 'editing' && (
        <ObjectPicker
          availableImages={availableImages.filter(img => img.id !== selectedImage?.id)}
          selectedObjectIds={settings.objects.map(obj => obj.id)}
          onObjectSelect={(image) => {
            const newObject: SelectedObject = {
              id: image.id,
              imageUrl: image.imageUrl,
              thumbnailUrl: image.thumbnailUrl,
              name: image.prompt || image.influencerName,
            };
            updateSetting('objects', [...settings.objects, newObject]);
          }}
          onObjectRemove={(imageId) => {
            updateSetting('objects', settings.objects.filter(obj => obj.id !== imageId));
          }}
          onClose={() => setShowObjectPicker(false)}
          maxObjects={3}
          hasUploadConsent={hasUploadConsent}
          onConsentAccept={onAcceptConsent}
          onUploadImage={onUploadImage}
        />
      )}
      </div>
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

