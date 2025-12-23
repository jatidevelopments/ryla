'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useInfluencer, useInfluencerStore } from '@ryla/business';
import { cn, RylaButton, Switch, Label } from '@ryla/ui';
import {
  SCENE_OPTIONS,
  ENVIRONMENT_OPTIONS,
  OUTFIT_OPTIONS,
} from '@ryla/shared';
import { ProtectedRoute } from '../../../../components/protected-route';
import { ZeroCreditsModal } from '../../../../components/credits';
import { useCredits } from '../../../../lib/hooks/use-credits';
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
} from 'lucide-react';

interface StudioSettings {
  scene: string;
  environment: string;
  outfit: string | null;
  aspectRatio: '1:1' | '9:16' | '2:3';
  qualityMode: 'draft' | 'hq';
  nsfwEnabled: boolean;
}

const DEFAULT_SETTINGS: StudioSettings = {
  scene: 'casual-day',
  environment: 'studio',
  outfit: null,
  aspectRatio: '1:1',
  qualityMode: 'draft',
  nsfwEnabled: false,
};

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square', description: '1:1' },
  { value: '9:16', label: 'Portrait', description: '9:16' },
  { value: '2:3', label: 'Tall', description: '2:3' },
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
  const influencerId = params.id as string;

  const influencer = useInfluencer(influencerId);
  const addPost = useInfluencerStore((state) => state.addPost);

  // Credit management
  const { balance, refetch: refetchCredits } = useCredits();
  const [showCreditModal, setShowCreditModal] = React.useState(false);

  // State
  const [settings, setSettings] = React.useState<StudioSettings>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedPost, setGeneratedPost] = React.useState<Post | null>(null);
  const [caption, setCaption] = React.useState('');

  // Expanded sections
  const [expandedSections, setExpandedSections] = React.useState({
    scene: true,
    environment: true,
    outfit: true,
    format: false,
    advanced: false,
  });

  if (!influencer) {
    notFound();
  }

  const creditCost = settings.qualityMode === 'hq' ? 10 : 5;

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

  const handleGenerate = async () => {
    if (balance < creditCost) {
      setShowCreditModal(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedPost(null);

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create mock post
    const newPost: Post = {
      id: `post-${Date.now()}`,
      influencerId,
      imageUrl: '',
      caption: '',
      isLiked: false,
      scene: settings.scene,
      environment: settings.environment,
      outfit: settings.outfit || influencer.outfit,
      aspectRatio: settings.aspectRatio,
      createdAt: new Date().toISOString(),
    };

    // Generate mock caption
    const mockCaptions = [
      'Good morning! ☀️ Feeling amazing today ✨',
      'Just another day being fabulous 💋',
      'Who needs a filter when you have this lighting? 📸',
      'Living my best life 🌟',
      'Confidence is my best accessory 💅',
    ];
    const generatedCaption =
      mockCaptions[Math.floor(Math.random() * mockCaptions.length)];

    setGeneratedPost(newPost);
    setCaption(generatedCaption);
    setIsGenerating(false);
    refetchCredits();
  };

  const handleSavePost = () => {
    if (generatedPost) {
      addPost({ ...generatedPost, caption });
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
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {ratio.label}
                    </span>
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
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[var(--text-primary)]">
                      HQ Mode
                    </Label>
                    <p className="text-xs text-[var(--text-muted)]">
                      Higher quality, 10 credits
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
                  <div className="text-center">
                    <div className="relative mb-4 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] rounded-full blur-xl opacity-30 animate-pulse" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)]">
                        <Sparkles className="h-6 w-6 text-white animate-pulse" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Generating...
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      This may take a few seconds
                    </p>
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

              {/* Caption Editor (when generated) */}
              {generatedPost && !isGenerating && (
                <div className="border-t border-[var(--border-default)] p-4">
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-2 block">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full h-20 resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--purple-500)] focus:outline-none transition-colors"
                    placeholder="Edit your caption..."
                  />
                </div>
              )}
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
                    Save Post
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
