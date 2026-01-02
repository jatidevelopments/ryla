'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams, notFound } from 'next/navigation';
import { useInfluencer, useInfluencerStore } from '@ryla/business';
import { cn, RylaButton, Switch, Label, PlatformBadgeGroup } from '@ryla/ui';
import { getPlatformsForAspectRatio } from '@ryla/shared';
import {
  SCENE_OPTIONS,
  ENVIRONMENT_OPTIONS,
  OUTFIT_OPTIONS,
  FEATURE_CREDITS,
} from '@ryla/shared';
import { ProtectedRoute } from '../../../../components/protected-route';
import { ZeroCreditsModal } from '../../../../components/credits';
import { useCredits } from '../../../../lib/hooks/use-credits';
import { useLocalStorage } from '../../../../lib/hooks/use-local-storage';
import type { Post } from '@ryla/shared';
import {
  ArrowLeft,
  Sparkles,
  Check,
  ImageIcon,
  Zap,
  Settings2,
  Palette,
  MapPin,
  Shirt,
  Maximize,
  Save,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Images,
  X,
} from 'lucide-react';
import {
  deleteImage,
  generateStudioImages,
  getCharacterImages,
  getComfyUIResults,
  inpaintEdit,
  likeImage,
} from '../../../../lib/api';
import { InpaintEditModal } from '../../../../components/studio/inpaint-edit-modal';
import { trpc } from '../../../../lib/trpc';

interface StudioSettings {
  scene: string;
  environment: string;
  outfit: string | null;
  aspectRatio: '1:1' | '9:16' | '2:3';
  qualityMode: 'draft' | 'hq';
  nsfwEnabled: boolean;
  modelProvider: 'comfyui' | 'fal';
  modelId: 'fal-ai/flux/schnell' | 'fal-ai/flux/dev';
}

const DEFAULT_SETTINGS: StudioSettings = {
  scene: 'candid-lifestyle',
  environment: 'studio',
  outfit: null,
  aspectRatio: '1:1',
  qualityMode: 'draft',
  nsfwEnabled: false,
  modelProvider: 'comfyui',
  modelId: 'fal-ai/flux/schnell',
};

const ASPECT_RATIOS = [
  { 
    value: '1:1', 
    label: 'Square', 
    description: '1:1',
    platforms: getPlatformsForAspectRatio('1:1').map(p => p.id),
  },
  { 
    value: '9:16', 
    label: 'Portrait', 
    description: '9:16',
    platforms: getPlatformsForAspectRatio('9:16').map(p => p.id),
  },
  { 
    value: '2:3', 
    label: 'Tall', 
    description: '2:3',
    platforms: getPlatformsForAspectRatio('2:3').map(p => p.id),
  },
] as const;

export default function StudioPage() {
  return (
    <ProtectedRoute>
      <StudioContent />
    </ProtectedRoute>
  );
}

function StudioContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const influencerId = params.id as string;

  const influencer = useInfluencer(influencerId);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);
  const { data: character, isLoading } = trpc.character.getById.useQuery(
    { id: influencerId },
    { enabled: !influencer }
  );
  const addPost = useInfluencerStore((state) => state.addPost);
  const [existingImages, setExistingImages] = React.useState<Post[]>([]);
  const preselectImageId = searchParams.get('imageId');

  // Credit management
  const utils = trpc.useUtils();
  const { balance, refetch: refetchCredits } = useCredits();
  const [showCreditModal, setShowCreditModal] = React.useState(false);

  // State with localStorage persistence
  const [settings, setSettings] = useLocalStorage<StudioSettings>(
    'ryla-studio-settings',
    DEFAULT_SETTINGS
  );
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedPost, setGeneratedPost] = React.useState<Post | null>(null);
  const [caption, setCaption] = React.useState('');
  const [selectedExistingPost, setSelectedExistingPost] = React.useState<Post | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  // Expanded sections with localStorage persistence
  const [expandedSections, setExpandedSections] = useLocalStorage('ryla-studio-expanded-sections', {
    existingImages: true,
    scene: true,
    environment: true,
    outfit: true,
    format: false,
    advanced: false,
  });

  React.useEffect(() => {
    if (!influencer && character) {
      addInfluencer({
        id: character.id,
        name: character.name,
        handle: character.handle || `@${character.name.toLowerCase().replace(/\s+/g, '.')}`,
        bio: character.config?.bio || 'New AI influencer ✨',
        avatar: character.baseImageUrl || null,
        gender: character.config?.gender || 'female',
        style: character.config?.style || 'realistic',
        ethnicity: character.config?.ethnicity || 'caucasian',
        age: character.config?.age || 25,
        hairStyle: character.config?.hairStyle || 'long-straight',
        hairColor: character.config?.hairColor || 'brown',
        eyeColor: character.config?.eyeColor || 'brown',
        bodyType: character.config?.bodyType || 'slim',
        breastSize: character.config?.breastSize,
        archetype: character.config?.archetype || 'girl-next-door',
        personalityTraits: character.config?.personalityTraits || [],
        outfit: character.config?.defaultOutfit || 'casual',
        nsfwEnabled: character.config?.nsfwEnabled || false,
        profilePictureSetId: character.config?.profilePictureSetId || undefined,
        postCount: parseInt(character.postCount || '0', 10),
        imageCount: 0,
        likedCount: parseInt(character.likedCount || '0', 10),
        createdAt: character.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: character.updatedAt?.toISOString() || new Date().toISOString(),
      });
    }
  }, [addInfluencer, character, influencer]);

  // Update settings when influencer NSFW setting changes
  React.useEffect(() => {
    if (influencer) {
      setSettings((prev) => {
        const newNsfwEnabled = influencer.nsfwEnabled || false;
        return {
          ...prev,
          nsfwEnabled: newNsfwEnabled,
          // When NSFW is enabled, force comfyui provider (supports adult models)
          modelProvider: newNsfwEnabled ? 'comfyui' : prev.modelProvider,
        };
      });
    }
  }, [influencer?.nsfwEnabled, influencer]);

  if (!influencer && isLoading) {
    return null;
  }

  if (!influencer && !character) {
    notFound();
  }

  const refreshExistingImages = React.useCallback(async () => {
    const rows = await getCharacterImages(influencerId);
    const mapped: Post[] = rows.map((row) => ({
      id: row.id,
      influencerId,
      imageUrl: row.s3Url || '',
      caption: '',
      isLiked: Boolean(row.liked),
      scene: row.scene || undefined,
      environment: row.environment || undefined,
      outfit: row.outfit || influencer.outfit,
      aspectRatio: (row.aspectRatio || '9:16') as Post['aspectRatio'],
      createdAt: row.createdAt || new Date().toISOString(),
    }));
    setExistingImages(mapped);
  }, [influencerId, influencer.outfit]);

  React.useEffect(() => {
    refreshExistingImages().catch((err) => console.error('Failed to load images:', err));
  }, [refreshExistingImages]);

  React.useEffect(() => {
    if (!preselectImageId || existingImages.length === 0) return;
    const match = existingImages.find((img) => img.id === preselectImageId);
    if (match) {
      setSelectedExistingPost(match);
      setSettings((prev) => ({
        ...prev,
        scene: match.scene || prev.scene,
        environment: match.environment || prev.environment,
        outfit: match.outfit || null,
        aspectRatio: match.aspectRatio || prev.aspectRatio,
      }));
    }
  }, [preselectImageId, existingImages]);

  // Credit costs from shared pricing (studio_standard for HQ, studio_fast for draft)
  const creditCost = settings.qualityMode === 'hq' 
    ? FEATURE_CREDITS.studio_standard.credits  // 50 credits
    : FEATURE_CREDITS.studio_fast.credits;      // 20 credits

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSettingChange = <K extends keyof StudioSettings>(
    key: K,
    value: StudioSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Handle selecting an existing post to copy its settings
  const handleSelectExistingPost = (post: Post) => {
    setSelectedExistingPost(post);
    // Apply settings from the selected post
    setSettings((prev) => ({
      ...prev,
      scene: post.scene || prev.scene,
      environment: post.environment || prev.environment,
      outfit: post.outfit || null,
      aspectRatio: post.aspectRatio || prev.aspectRatio,
    }));
  };

  // Clear the selected existing post
  const handleClearExistingPost = () => {
    setSelectedExistingPost(null);
  };

  const handleGenerate = async () => {
    if (balance < creditCost) {
      setShowCreditModal(true);
      return;
    }

    // Hard invariant: wizard-created influencers must always have a base image.
    // If legacy data slips through, fail fast instead of generating inconsistent results.
    if (!influencer.avatar) {
      throw new Error('Missing base image for this influencer. Please re-run the wizard base image step.');
    }

    setIsGenerating(true);
    setGeneratedPost(null);
    setCaption(''); // captions are Phase 2+ (kept empty in MVP)

    try {
      // NOTE: influencerId in web is the same as characterId in API/DB
      const start = await generateStudioImages({
        characterId: influencerId,
        scene: settings.scene,
        environment: settings.environment,
        outfit: settings.outfit || influencer.outfit,
        aspectRatio: settings.aspectRatio,
        qualityMode: settings.qualityMode,
        count: 1,
        nsfw: settings.nsfwEnabled,
        modelProvider: settings.nsfwEnabled ? 'comfyui' : settings.modelProvider,
        modelId:
          settings.nsfwEnabled || settings.modelProvider !== 'fal'
            ? undefined
            : settings.modelId,
      });

      const promptId = start.jobs[0]?.promptId;
      if (!promptId) {
        throw new Error('Generation did not return a promptId');
      }

      // Poll until complete (simple MVP polling)
      let attempts = 0;
      while (attempts < 120) {
        attempts++;
        const res = await getComfyUIResults(promptId);
        if (res.status === 'completed' && res.images?.[0]?.url) {
          const img = res.images[0];
    const newPost: Post = {
            id: img.id,
      influencerId,
            imageUrl: img.url,
      caption: '',
      isLiked: false,
      scene: settings.scene,
      environment: settings.environment,
      outfit: settings.outfit || influencer.outfit,
      aspectRatio: settings.aspectRatio,
      createdAt: new Date().toISOString(),
    };
    setGeneratedPost(newPost);
          await refreshExistingImages();
          break;
        }
        if (res.status === 'failed') {
          throw new Error(res.error || 'Generation failed');
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    } finally {
    setIsGenerating(false);
    refetchCredits();
    // Invalidate activity feed to show new generation + credit usage
    utils.activity.list.invalidate();
    utils.activity.summary.invalidate();
    // Invalidate notifications (generation complete)
    utils.notifications.list.invalidate();
    }
  };

  const handleSavePost = () => {
    if (generatedPost) {
      // Treat store "Post" as a view-model for a saved image asset (captions are Phase 2+)
      addPost({ ...generatedPost, caption: '' });
      router.push(`/influencer/${influencerId}`);
    }
  };

  const handleDiscard = () => {
    setGeneratedPost(null);
    setCaption('');
  };

  const handleRegenerate = () => {
    setGeneratedPost(null);
    setCaption('');
    handleGenerate();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg-base)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 lg:px-6">
          {/* Back Button */}
          <Link
            href={`/influencer/${influencerId}`}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] group"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center group-hover:bg-[var(--bg-surface)] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">Back to Profile</span>
          </Link>

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[var(--border-default)]">
              {influencer.avatar ? (
                <Image
                  src={influencer.avatar}
                  alt={influencer.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-xs font-bold text-white">
                  {influencer.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-sm font-semibold text-[var(--text-primary)]">
                Content Studio
              </h1>
              <p className="text-xs text-[var(--text-muted)] hidden sm:block">
                {influencer.name}
              </p>
            </div>
          </div>

          {/* Credits indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-[var(--purple-400)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {balance}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        <div className="mx-auto w-full max-w-4xl flex flex-col lg:flex-row gap-6 px-4 lg:px-6 py-6">
          {/* Left: Settings Panel */}
          <div className="flex-1 lg:max-w-md space-y-4">
            {/* Existing Images Section */}
            {existingImages.length > 0 && (
              <SettingsSection
                title={`Use Existing Image (${existingImages.length})`}
                icon={<Images className="h-4 w-4" />}
                expanded={expandedSections.existingImages}
                onToggle={() => toggleSection('existingImages')}
              >
                <div className="space-y-3">
                  {selectedExistingPost && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-[var(--purple-500)]/10 to-[var(--pink-500)]/10 border border-[var(--purple-400)]/30">
                      <div className="flex items-center gap-2">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-default)]">
                          {selectedExistingPost.imageUrl ? (
                            <Image
                              src={selectedExistingPost.imageUrl}
                              alt="Selected"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[var(--text-primary)]">
                            Settings copied
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {selectedExistingPost.scene} • {selectedExistingPost.environment}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setIsEditOpen(true)}
                          disabled={!selectedExistingPost.imageUrl}
                          className="px-2 py-1 text-[10px] rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                      <button
                        onClick={handleClearExistingPost}
                        className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      </button>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent">
                    {existingImages.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handleSelectExistingPost(post)}
                        className={cn(
                          'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                          selectedExistingPost?.id === post.id
                            ? 'border-[var(--purple-400)] ring-2 ring-[var(--purple-400)]/30'
                            : 'border-[var(--border-default)] hover:border-[var(--border-hover)]'
                        )}
                      >
                        {post.imageUrl ? (
                          <Image
                            src={post.imageUrl}
                            alt={post.caption || 'Existing post'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--purple-500)]/10 to-[var(--pink-500)]/10">
                            <ImageIcon className="h-5 w-5 text-[var(--text-muted)]" />
                          </div>
                        )}
                        {selectedExistingPost?.id === post.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[var(--purple-500)]/30">
                            <div className="w-5 h-5 rounded-full bg-[var(--purple-500)] flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Select an image to copy its scene, environment & outfit settings
                  </p>
                </div>
              </SettingsSection>
            )}

            {/* Scene Section */}
            <SettingsSection
              title="Scene"
              icon={<Palette className="h-4 w-4" />}
              expanded={expandedSections.scene}
              onToggle={() => toggleSection('scene')}
            >
              <div className="grid grid-cols-3 gap-2">
                {SCENE_OPTIONS.map((scene) => (
                  <OptionChip
                    key={scene.value}
                    label={scene.label}
                    emoji={scene.emoji}
                    selected={settings.scene === scene.value}
                    onSelect={() => handleSettingChange('scene', scene.value)}
                  />
                ))}
              </div>
            </SettingsSection>

            {/* Environment Section */}
            <SettingsSection
              title="Environment"
              icon={<MapPin className="h-4 w-4" />}
              expanded={expandedSections.environment}
              onToggle={() => toggleSection('environment')}
            >
              <div className="grid grid-cols-3 gap-2">
                {ENVIRONMENT_OPTIONS.map((env) => (
                  <OptionChip
                    key={env.value}
                    label={env.label}
                    emoji={env.emoji}
                    selected={settings.environment === env.value}
                    onSelect={() => handleSettingChange('environment', env.value)}
                  />
                ))}
              </div>
            </SettingsSection>

            {/* Outfit Section */}
            <SettingsSection
              title="Outfit"
              icon={<Shirt className="h-4 w-4" />}
              expanded={expandedSections.outfit}
              onToggle={() => toggleSection('outfit')}
            >
              <div className="flex flex-wrap gap-2">
                <OptionPill
                  label="Keep Current"
                  selected={settings.outfit === null}
                  onSelect={() => handleSettingChange('outfit', null)}
                />
                {OUTFIT_OPTIONS.slice(0, 8).map((outfit) => {
                  const outfitValue = outfit.label
                    .toLowerCase()
                    .replace(/\s+/g, '-');
                  return (
                    <OptionPill
                      key={outfitValue}
                      label={outfit.label}
                      selected={settings.outfit === outfitValue}
                      onSelect={() => handleSettingChange('outfit', outfitValue)}
                    />
                  );
                })}
              </div>
            </SettingsSection>

            {/* Format Section */}
            <SettingsSection
              title="Format"
              icon={<Maximize className="h-4 w-4" />}
              expanded={expandedSections.format}
              onToggle={() => toggleSection('format')}
            >
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() =>
                      handleSettingChange(
                        'aspectRatio',
                        ratio.value as '1:1' | '9:16' | '2:3'
                      )
                    }
                    className={cn(
                      'flex flex-col items-center rounded-lg border p-3 transition-all duration-200',
                      settings.aspectRatio === ratio.value
                        ? 'border-[var(--purple-400)]/50 bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20'
                        : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)]'
                    )}
                  >
                    <div
                      className={cn(
                        'mb-2 rounded border',
                        ratio.value === '1:1' && 'h-6 w-6',
                        ratio.value === '9:16' && 'h-8 w-5',
                        ratio.value === '2:3' && 'h-7 w-5',
                        settings.aspectRatio === ratio.value
                          ? 'border-[var(--purple-400)] bg-[var(--purple-500)]/20'
                          : 'border-[var(--border-default)] bg-[var(--bg-subtle)]'
                      )}
                    />
                    <span className="text-xs font-medium text-[var(--text-secondary)] mb-1">
                      {ratio.label}
                    </span>
                    {/* Platform badges */}
                    {ratio.platforms && ratio.platforms.length > 0 && (
                      <div className="flex justify-center mt-1">
                        <PlatformBadgeGroup
                          platformIds={ratio.platforms}
                          size="sm"
                          maxVisible={3}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SettingsSection>

            {/* Advanced Settings Section */}
            <SettingsSection
              title="Advanced"
              icon={<Settings2 className="h-4 w-4" />}
              expanded={expandedSections.advanced}
              onToggle={() => toggleSection('advanced')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-sm text-[var(--text-primary)]">
                      Model
                    </Label>
                    <p className="text-xs text-[var(--text-muted)]">
                      NSFW always uses on-server
                    </p>
                  </div>
                  <select
                    className="h-9 min-w-[200px] rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                    value={settings.modelProvider === 'comfyui' ? 'comfyui' : settings.modelId}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === 'comfyui') {
                        handleSettingChange('modelProvider', 'comfyui');
                      } else if (v === 'fal-ai/flux/schnell' || v === 'fal-ai/flux/dev') {
                        handleSettingChange('modelProvider', 'fal');
                        handleSettingChange('modelId', v);
                      }
                    }}
                    disabled={settings.nsfwEnabled}
                  >
                    <option value="comfyui">On-server (ComfyUI)</option>
                    <option value="fal-ai/flux/schnell">Fal: FLUX Schnell</option>
                    <option value="fal-ai/flux/dev">Fal: FLUX Dev</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[var(--text-primary)]">
                      HQ Mode
                    </Label>
                    <p className="text-xs text-[var(--text-muted)]">
                      Higher quality, {FEATURE_CREDITS.studio_standard.credits} credits
                    </p>
                  </div>
                  <Switch
                    checked={settings.qualityMode === 'hq'}
                    onCheckedChange={(checked) =>
                      handleSettingChange('qualityMode', checked ? 'hq' : 'draft')
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[var(--text-primary)]">
                      18+ Content
                    </Label>
                    <p className="text-xs text-[var(--text-muted)]">
                      Enable mature content
                    </p>
                  </div>
                  <Switch
                    checked={settings.nsfwEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingChange('nsfwEnabled', checked)
                    }
                  />
                </div>
              </div>
            </SettingsSection>
          </div>

          {/* Right: Preview & Actions */}
          <div className="flex-1 lg:max-w-md flex flex-col">
            {/* Preview Card */}
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] overflow-hidden flex-1 flex flex-col">
              {/* Preview Area */}
              <div className="flex-1 flex items-center justify-center p-6 min-h-[280px]">
                {isGenerating ? (
                  <div className="text-center space-y-4">
                    <div className="relative mx-auto w-12 h-12">
                      {/* Subtle glow background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 rounded-full blur-md" />
                      {/* Spinner ring */}
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 rounded-full border-2 border-[var(--purple-500)]/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--purple-500)] animate-spin" />
                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-[var(--purple-400)]" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Generating...
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        This may take a few seconds
                      </p>
                    </div>
                  </div>
                ) : generatedPost ? (
                  <div className="w-full">
                    <div
                      className={cn(
                        'relative mx-auto rounded-xl bg-gradient-to-br from-[var(--purple-500)]/10 to-[var(--pink-500)]/10 border border-[var(--border-default)] overflow-hidden',
                        settings.aspectRatio === '1:1' &&
                          'aspect-square max-w-[220px]',
                        settings.aspectRatio === '9:16' &&
                          'aspect-[9/16] max-w-[160px]',
                        settings.aspectRatio === '2:3' &&
                          'aspect-[2/3] max-w-[180px]'
                      )}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-[var(--text-muted)]/30" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
                      <ImageIcon className="h-6 w-6 text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      Preview will appear here
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Configure settings and generate
                    </p>
                  </div>
                )}
              </div>

              {/* Captions are Phase 2+ (intentionally omitted in MVP) */}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-3">
              {generatedPost && !isGenerating ? (
                <>
                  <div className="flex gap-3">
                    <RylaButton
                      onClick={handleDiscard}
                      variant="glassy-outline"
                      size="lg"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Discard
                    </RylaButton>
                    <RylaButton
                      onClick={handleRegenerate}
                      variant="glassy-outline"
                      size="lg"
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </RylaButton>
                  </div>
                  <RylaButton
                    onClick={handleSavePost}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Image
                  </RylaButton>
                </>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-14 rounded-xl font-bold text-base transition-all duration-200 relative overflow-hidden bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)] text-white shadow-lg shadow-[var(--purple-500)]/25 hover:shadow-[var(--purple-500)]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {isGenerating
                      ? 'Generating...'
                      : `Generate Content (${creditCost} credits)`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zero Credits Modal */}
      <InpaintEditModal
        open={isEditOpen}
        imageUrl={selectedExistingPost?.imageUrl || ''}
        onClose={() => setIsEditOpen(false)}
        onApply={async ({ maskedImageBase64Png, prompt }) => {
          if (!selectedExistingPost) return;
          if (!prompt.trim()) return;

          const start = await inpaintEdit({
            characterId: influencerId,
            sourceImageId: selectedExistingPost.id,
            prompt,
            maskedImageBase64Png,
          });

          let attempts = 0;
          while (attempts < 120) {
            attempts++;
            const res = await getComfyUIResults(start.promptId);
            if (res.status === 'completed' && res.images?.[0]?.url) {
              const img = res.images[0];
              const edited: Post = {
                id: img.id,
                influencerId,
                imageUrl: img.url,
                caption: '',
                isLiked: false,
                scene: selectedExistingPost.scene,
                environment: selectedExistingPost.environment,
                outfit: selectedExistingPost.outfit,
                aspectRatio: selectedExistingPost.aspectRatio,
                createdAt: new Date().toISOString(),
              };
              setGeneratedPost(edited);
              setCaption('');
              setIsEditOpen(false);
              break;
            }
            if (res.status === 'failed') {
              throw new Error(res.error || 'Edit failed');
            }
            await new Promise((r) => setTimeout(r, 1500));
          }
        }}
      />

      <ZeroCreditsModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        creditsNeeded={creditCost}
        currentBalance={balance}
      />
    </div>
  );
}

// Settings Section Component
function SettingsSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[var(--purple-400)]">{icon}</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {title}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[var(--border-default)]">
          {children}
        </div>
      )}
    </div>
  );
}

// Option Chip Component
function OptionChip({
  label,
  emoji,
  selected,
  onSelect,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center rounded-lg border p-2.5 transition-all duration-200 min-h-[64px]',
        selected
          ? 'border-[var(--purple-400)]/50 bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20'
          : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)]'
      )}
    >
      {emoji && <span className="text-lg mb-1">{emoji}</span>}
      <span
        className={cn(
          'text-xs font-medium text-center',
          selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
        )}
      >
        {label}
      </span>
    </button>
  );
}

// Option Pill Component
function OptionPill({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
        selected
          ? 'border-[var(--purple-400)]/50 bg-gradient-to-r from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 text-[var(--text-primary)]'
          : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
      )}
    >
      {label}
    </button>
  );
}
