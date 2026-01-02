'use client';

import * as React from 'react';
import { useAllInfluencers } from '@ryla/business';
import { FadeInUp } from '@ryla/ui';
import { ProtectedRoute } from '../../components/protected-route';
import {
  deleteImage,
  generateStudioImages,
  getCharacterImages,
  getComfyUIResults,
  likeImage,
} from '../../lib/api/studio';
import {
  StudioGallery,
  StudioHeader,
  StudioToolbar,
  StudioDetailPanel,
  type StudioImage,
  type ViewMode,
  type AspectRatioFilter,
  type StatusFilter,
  type LikedFilter,
  type SortBy,
} from '../../components/studio';
import {
  StudioGenerationBar,
  type GenerationSettings,
} from '../../components/studio/generation';
import { trpc } from '../../lib/trpc';
import { useCredits } from '../../lib/hooks';
import { useLocalStorage } from '../../lib/hooks/use-local-storage';

export default function StudioPage() {
  return (
    <ProtectedRoute>
      <StudioContent />
    </ProtectedRoute>
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function StudioContent() {
  const utils = trpc.useUtils();
  const { balance: creditsBalance, refetch: refetchCredits } = useCredits();
  const influencersData = useAllInfluencers();
  const influencers = React.useMemo(() => influencersData || [], [influencersData]);

  // Filter states with localStorage persistence
  const [selectedInfluencerId, setSelectedInfluencerId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState(''); // Don't persist search - always start fresh
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('ryla-gallery-view-mode', 'grid');
  // Handle migration from old single value format to array format for aspect ratios
  const [aspectRatioRaw, setAspectRatioRaw] = useLocalStorage<AspectRatioFilter | AspectRatio[]>('ryla-gallery-aspect-ratio', 'all');
  
  // Migrate old format to new format
  const aspectRatios = React.useMemo(() => {
    if (typeof aspectRatioRaw === 'string') {
      // Old format - migrate to array
      const migrated = aspectRatioRaw === 'all' ? [] : [aspectRatioRaw as AspectRatio];
      // Update localStorage with new format
      setTimeout(() => setAspectRatioRaw(migrated), 0);
      return migrated;
    }
    // Already in array format
    if (Array.isArray(aspectRatioRaw)) {
      return aspectRatioRaw;
    }
    return [];
  }, [aspectRatioRaw, setAspectRatioRaw]);
  
  const setAspectRatios = React.useCallback((value: AspectRatio[] | ((val: AspectRatio[]) => AspectRatio[])) => {
    setAspectRatioRaw(value as any);
  }, [setAspectRatioRaw]);
  const [status, setStatus] = useLocalStorage<StatusFilter>('ryla-gallery-status', 'all');
  const [liked, setLiked] = useLocalStorage<LikedFilter>('ryla-gallery-liked', 'all');
  const [sortBy, setSortBy] = useLocalStorage<SortBy>('ryla-gallery-sort-by', 'newest');

  // Detail panel state with localStorage persistence
  const [selectedImage, setSelectedImage] = React.useState<StudioImage | null>(null);
  const [showPanel, setShowPanel] = useLocalStorage('ryla-gallery-show-panel', true);

  // Generation state - track active generation jobs
  const [activeGenerations, setActiveGenerations] = React.useState<Set<string>>(new Set());

  const [allImages, setAllImages] = React.useState<StudioImage[]>([]);
  const validInfluencers = React.useMemo(
    () => influencers.filter((i) => isUuid(i.id)),
    [influencers]
  );

  const refreshImages = React.useCallback(
    async (characterId: string) => {
      if (!isUuid(characterId)) {
        // Legacy local-only influencers (e.g. influencer-*) can't be used with DB-backed gallery.
        setAllImages([]);
        return;
      }
      const rows = await getCharacterImages(characterId);
      const influencer = validInfluencers.find((i) => i.id === characterId);
      const mapped: StudioImage[] = rows.map((row) => ({
        id: row.id,
        imageUrl: row.s3Url || '',
        thumbnailUrl: row.thumbnailUrl || undefined,
        influencerId: characterId,
        influencerName: influencer?.name || 'Unknown',
        influencerAvatar: influencer?.avatar || undefined,
        prompt: row.prompt || undefined,
        scene: row.scene || undefined,
        environment: row.environment || undefined,
        aspectRatio: (row.aspectRatio || '9:16') as StudioImage['aspectRatio'],
        status:
          row.status === 'completed'
            ? 'completed'
            : row.status === 'failed'
            ? 'failed'
            : 'generating',
        createdAt: row.createdAt || new Date().toISOString(),
        isLiked: Boolean(row.liked),
      }));
      
      // Replace placeholders with real images - remove all placeholders for this character
      // since real images from DB will have proper IDs and URLs
      setAllImages((prev) => {
        // Keep placeholders for other characters, but remove all for this character
        const placeholdersForOtherChars = prev.filter(
          (img) => img.id.startsWith('placeholder-') && img.influencerId !== characterId
        );
        
        // Return real images + placeholders for other characters only
        // Real images will replace placeholders naturally since they have different IDs
        return [...mapped, ...placeholdersForOtherChars];
      });
    },
    [validInfluencers]
  );

  React.useEffect(() => {
    if (!selectedInfluencerId && validInfluencers[0]?.id) {
      setSelectedInfluencerId(validInfluencers[0].id);
    }
  }, [selectedInfluencerId, validInfluencers]);

  React.useEffect(() => {
    if (!selectedInfluencerId) return;
    refreshImages(selectedInfluencerId).catch((err) =>
      console.error('Failed to load images:', err)
    );
  }, [selectedInfluencerId, refreshImages]);

  // Calculate image counts per influencer
  const influencerTabs = React.useMemo(() => {
    if (!Array.isArray(validInfluencers) || validInfluencers.length === 0) {
      return [];
    }
    return validInfluencers.map((influencer) => ({
      id: influencer.id,
      name: influencer.name,
      avatar: influencer.avatar || undefined,
      imageCount: allImages.filter((img) => img.influencerId === influencer.id).length,
    }));
  }, [validInfluencers, allImages]);

  // Get influencer list for generation bar
  const influencerList = React.useMemo(() => {
    if (!Array.isArray(validInfluencers) || validInfluencers.length === 0) {
      return [];
    }
    return validInfluencers.map((influencer) => ({
      id: influencer.id,
      name: influencer.name,
      avatar: influencer.avatar || undefined,
    }));
  }, [validInfluencers]);

  // Selected influencer for generation
  const selectedInfluencerForGeneration = React.useMemo(() => {
    if (selectedInfluencerId) {
      return influencerList.find((i) => i.id === selectedInfluencerId) || null;
    }
    return influencerList[0] || null;
  }, [selectedInfluencerId, influencerList]);

  // Filter images
  const filteredImages = React.useMemo(() => {
    let result = [...allImages];

    // Filter by influencer
    if (selectedInfluencerId) {
      result = result.filter((img) => img.influencerId === selectedInfluencerId);
    }

    // Filter by status
    if (status !== 'all') {
      result = result.filter((img) => img.status === status);
    }

    // Filter by aspect ratio
    if (aspectRatios.length > 0) {
      result = result.filter((img) => aspectRatios.includes(img.aspectRatio as AspectRatio));
    }

    // Filter by liked status
    if (liked !== 'all') {
      if (liked === 'liked') {
        result = result.filter((img) => img.isLiked === true);
      } else if (liked === 'not-liked') {
        result = result.filter((img) => img.isLiked === false);
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.prompt?.toLowerCase().includes(search) ||
          img.influencerName.toLowerCase().includes(search) ||
          img.scene?.toLowerCase().includes(search) ||
          img.environment?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allImages, selectedInfluencerId, status, aspectRatios, liked, searchQuery, sortBy]);

  // Handle image selection
  const handleSelectImage = (image: StudioImage | null) => {
    setSelectedImage(image);
    if (image) {
      setShowPanel(true);
    }
  };

  // Handle like
  const handleLike = async (imageId: string) => {
    try {
      const res = await likeImage(imageId);
      setAllImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, isLiked: res.liked } : img))
      );
      if (selectedImage?.id === imageId) {
        setSelectedImage((prev) => (prev ? { ...prev, isLiked: res.liked } : null));
      }
      return;
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  // Handle delete
  const handleDelete = async (imageId: string) => {
    try {
      await deleteImage(imageId);
      if (selectedImage?.id === imageId) setSelectedImage(null);
      if (selectedInfluencerId) {
        await refreshImages(selectedInfluencerId);
      } else {
        setAllImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Handle download
  const handleDownload = async (image: StudioImage) => {
    if (!image.imageUrl) return;
    
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ryla-${image.influencerName.toLowerCase().replace(/\s+/g, '-')}-${image.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Handle generate - non-blocking with optimistic updates
  const handleGenerate = async (settings: GenerationSettings) => {
    if (!settings.influencerId) return;
    const influencer = influencers.find((i) => i.id === settings.influencerId);
    if (!influencer) return;

    const supportedAspectRatios = new Set(['1:1', '9:16', '2:3']);
    const aspectRatio = supportedAspectRatios.has(settings.aspectRatio)
      ? (settings.aspectRatio as '1:1' | '9:16' | '2:3')
      : '9:16';

    const qualityMode = settings.quality === '1.5k' ? 'draft' : 'hq';

    try {
      const started = await generateStudioImages({
        characterId: settings.influencerId,
        prompt: settings.prompt,
        scene: 'candid-lifestyle',
        environment: 'studio',
        outfit: influencer.outfit || 'casual',
        aspectRatio,
        qualityMode,
        count: Math.max(1, Math.min(10, settings.batchSize)),
        nsfw: Boolean(influencer.nsfwEnabled),
      });

      // Create placeholder images immediately
      const placeholderImages: (StudioImage & { _promptId?: string })[] = started.jobs.map(
        (job, index) => ({
          id: `placeholder-${job.promptId}`, // Temporary ID using promptId
          imageUrl: '',
          influencerId: settings.influencerId,
          influencerName: influencer.name || 'Unknown',
          influencerAvatar: influencer.avatar || undefined,
          prompt: settings.prompt || undefined,
          scene: 'candid-lifestyle',
          environment: 'studio',
          aspectRatio,
          status: 'generating' as const,
          createdAt: new Date().toISOString(),
          isLiked: false,
          // Store promptId for tracking
          _promptId: job.promptId,
        })
      );

      // Add placeholders to state immediately
      setAllImages((prev) => [...placeholderImages, ...prev]);

      // Track active generations
      const promptIds = started.jobs.map((j) => j.promptId);
      setActiveGenerations((prev) => {
        const next = new Set(prev);
        promptIds.forEach((pid) => next.add(pid));
        return next;
      });

      // Start background polling (non-blocking)
      void pollGenerationResults(promptIds, settings.influencerId);

      // Invalidate activity feed and refresh credits immediately
      utils.activity.list.invalidate();
      utils.activity.summary.invalidate();
      refetchCredits();
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  // Background polling function - updates images as they complete
  const pollGenerationResults = async (promptIds: string[], characterId: string) => {
    const timeoutMs = 3 * 60 * 1000;
    const start = Date.now();
    const completedPromptIds = new Set<string>();

    while (Date.now() - start < timeoutMs && completedPromptIds.size < promptIds.length) {
      try {
        // Poll all remaining promptIds
        const remainingPromptIds = promptIds.filter((pid) => !completedPromptIds.has(pid));
        const results = await Promise.all(
          remainingPromptIds.map((pid) => getComfyUIResults(pid))
        );

        // Check which jobs completed
        const newlyCompleted: string[] = [];
        results.forEach((result, index) => {
          const promptId = remainingPromptIds[index];
          if (result.status === 'completed' || result.status === 'failed') {
            if (!completedPromptIds.has(promptId)) {
              completedPromptIds.add(promptId);
              newlyCompleted.push(promptId);
            }
          }
        });

        // If any jobs just completed, refresh from server immediately to get real images
        if (newlyCompleted.length > 0) {
          await refreshImages(characterId);
        }

        // If all done, clean up tracking
        if (completedPromptIds.size === promptIds.length) {
          // Remove completed promptIds from active generations
          setActiveGenerations((prev) => {
            const next = new Set(prev);
            promptIds.forEach((pid) => next.delete(pid));
            return next;
          });
          // Invalidate notifications
          utils.notifications.list.invalidate();
          break;
        }

        await new Promise((r) => setTimeout(r, 2000)); // Poll every 2 seconds
      } catch (err) {
        console.error('Polling error:', err);
        // Continue polling on error
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // Final refresh to ensure we have all images
    try {
      await refreshImages(characterId);
      setActiveGenerations((prev) => {
        const next = new Set(prev);
        promptIds.forEach((pid) => next.delete(pid));
        return next;
      });
    } catch (err) {
      console.error('Final refresh failed:', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[var(--bg-base)]">
      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 right-0 h-[500px] w-[500px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-40 left-0 h-[400px] w-[400px] opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Studio Header - Influencer Tabs */}
      <FadeInUp>
        <StudioHeader
          influencers={influencerTabs}
          selectedInfluencerId={selectedInfluencerId}
          onSelectInfluencer={setSelectedInfluencerId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={allImages.length}
        />
      </FadeInUp>

      {/* Toolbar - Filters and View Options */}
      <FadeInUp delay={50}>
        <StudioToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          aspectRatios={aspectRatios}
          onAspectRatioChange={setAspectRatios}
          status={status}
          onStatusChange={setStatus}
          liked={liked}
          onLikedChange={setLiked}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          selectedCount={selectedImage ? 1 : 0}
          onClearSelection={() => setSelectedImage(null)}
        />
      </FadeInUp>

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Gallery */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <FadeInUp delay={100}>
            <StudioGallery
              images={filteredImages}
              selectedImage={selectedImage}
              onSelectImage={handleSelectImage}
              onQuickLike={handleLike}
              onQuickDownload={handleDownload}
              viewMode={viewMode}
            />
          </FadeInUp>
        </div>

        {/* Right Panel - Detail View */}
        {showPanel && selectedImage && (
          <StudioDetailPanel
            image={selectedImage}
            onClose={() => {
              setSelectedImage(null);
              setShowPanel(false);
            }}
            onLike={handleLike}
            onDelete={handleDelete}
            onDownload={handleDownload}
            editHref={
              selectedImage
                ? `/influencer/${encodeURIComponent(selectedImage.influencerId)}/studio?imageId=${encodeURIComponent(selectedImage.id)}`
                : undefined
            }
            className="hidden w-[380px] flex-shrink-0 lg:flex"
          />
        )}
      </div>

      {/* Bottom Generation Bar */}
      <FadeInUp delay={150}>
        <StudioGenerationBar
          influencers={influencerList}
          selectedInfluencer={selectedInfluencerForGeneration}
          onGenerate={handleGenerate}
          isGenerating={activeGenerations.size > 0}
          creditsAvailable={creditsBalance}
        />
      </FadeInUp>
    </div>
  );
}
