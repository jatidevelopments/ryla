'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
  type AdultFilter,
  type SortBy,
} from '../../components/studio';
import type { OutfitComposition } from '@ryla/shared';
import {
  StudioGenerationBar,
  type GenerationSettings,
  type StudioMode,
  type ContentType,
  type AspectRatio,
} from '../../components/studio/generation';
import { trpc } from '../../lib/trpc';
import { useCredits } from '../../lib/hooks';
import { useLocalStorage } from '../../lib/hooks/use-local-storage';
import { TutorialOverlay, useTutorial, type TutorialStepType } from '@ryla/ui';
import { DevPanel } from '../../components/dev/dev-panel';

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

// Studio tutorial steps definition
const studioTutorialSteps: TutorialStepType[] = [
  {
    id: 'character-selection',
    target: '[data-tutorial-target="character-selector"]',
    message: 'Select an AI Influencer to generate images for',
    position: 'bottom',
    pointerDirection: 'up',
  },
  {
    id: 'mode-tabs',
    target: '[data-tutorial-target="mode-tabs"]',
    message:
      'Switch between Creating new images, Editing existing ones, or Upscaling for higher resolution',
    position: 'bottom',
    pointerDirection: 'up',
  },
  {
    id: 'content-type',
    target: '[data-tutorial-target="content-type-selector"]',
    message: 'Choose to generate Images or Videos (Video coming soon!)',
    position: 'bottom',
    pointerDirection: 'up',
  },
  {
    id: 'generation-controls',
    target: '[data-tutorial-target="generation-controls"]',
    message: 'Choose a scene, environment, and outfit for your images',
    position: 'top',
    pointerDirection: 'down',
  },
  {
    id: 'generation-settings',
    target: '[data-tutorial-target="generation-settings"]',
    message: 'Adjust settings: aspect ratio, quality, and batch size',
    position: 'top',
    pointerDirection: 'down',
  },
  {
    id: 'generate-button',
    target: '[data-tutorial-target="generate-button"]',
    message: 'Click Generate to create your images. Each image costs credits.',
    position: 'top',
    pointerDirection: 'down',
  },
  {
    id: 'gallery',
    target: '[data-tutorial-target="gallery"]',
    message: 'View your generated images here. Like, download, or delete them.',
    position: 'top',
    pointerDirection: 'down',
  },
];

function StudioContent() {
  const utils = trpc.useUtils();
  const searchParams = useSearchParams();

  // Tutorial state
  const tutorial = useTutorial('studio', studioTutorialSteps, {
    autoStart: true,
  });

  // Check upload consent
  const { data: consentData } = trpc.user.hasUploadConsent.useQuery();
  const acceptConsentMutation = trpc.user.acceptUploadConsent.useMutation({
    onSuccess: () => {
      utils.user.hasUploadConsent.invalidate();
    },
  });
  const uploadImageMutation = trpc.user.uploadObjectImage.useMutation();
  const { balance: creditsBalance, refetch: refetchCredits } = useCredits();

  // Fetch influencers with image counts from backend
  const { data: charactersData } = trpc.character.list.useQuery();

  // Map Character data to AIInfluencer format with imageCount from backend
  const influencers = React.useMemo(() => {
    if (!charactersData?.items) return [];
    return charactersData.items.map((char) => ({
      id: char.id,
      name: char.name,
      handle: char.handle || `@${char.name.toLowerCase().replace(/\s+/g, '.')}`,
      bio: char.config?.bio || 'New AI influencer ✨',
      avatar: char.baseImageUrl || null,
      gender: char.config?.gender || 'female',
      style: char.config?.style || 'realistic',
      ethnicity: char.config?.ethnicity || 'caucasian',
      age: char.config?.age || 25,
      hairStyle: char.config?.hairStyle || 'long-straight',
      hairColor: char.config?.hairColor || 'brown',
      eyeColor: char.config?.eyeColor || 'brown',
      bodyType: char.config?.bodyType || 'slim',
      breastSize: char.config?.breastSize,
      archetype: char.config?.archetype || 'girl-next-door',
      personalityTraits: char.config?.personalityTraits || [],
      outfit: char.config?.defaultOutfit || 'casual',
      nsfwEnabled: char.config?.nsfwEnabled || false,
      profilePictureSetId: char.config?.profilePictureSetId || undefined,
      postCount: parseInt(char.postCount || '0', 10),
      imageCount: (char as any).imageCount ?? 0, // imageCount from backend
      likedCount: parseInt(char.likedCount || '0', 10),
      createdAt: char.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: char.createdAt?.toISOString() || new Date().toISOString(),
    }));
  }, [charactersData]);

  // Get influencer from query params
  const influencerFromQuery = searchParams.get('influencer');
  const imageIdFromQuery = searchParams.get('imageId');
  const shouldOpenEdit = searchParams.get('edit') === 'true';

  // Filter states with localStorage persistence
  const [selectedInfluencerId, setSelectedInfluencerId] = React.useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = React.useState(''); // Don't persist search - always start fresh
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    'ryla-gallery-view-mode',
    'grid'
  );
  // Handle migration from old single value format to array format for aspect ratios
  const [aspectRatioRaw, setAspectRatioRaw] = useLocalStorage<
    AspectRatioFilter | AspectRatio[]
  >('ryla-gallery-aspect-ratio', 'all');

  // Migrate old format to new format
  const aspectRatios = React.useMemo(() => {
    if (typeof aspectRatioRaw === 'string') {
      // Old format - migrate to array
      const migrated =
        aspectRatioRaw === 'all' ? [] : [aspectRatioRaw as AspectRatio];
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

  const setAspectRatios = React.useCallback(
    (value: AspectRatio[] | ((val: AspectRatio[]) => AspectRatio[])) => {
      setAspectRatioRaw(value as any);
    },
    [setAspectRatioRaw]
  );
  const [status, setStatus] = useLocalStorage<StatusFilter>(
    'ryla-gallery-status',
    'all'
  );
  const [liked, setLiked] = useLocalStorage<LikedFilter>(
    'ryla-gallery-liked',
    'all'
  );
  const [adult, setAdult] = useLocalStorage<AdultFilter>(
    'ryla-gallery-adult',
    'all'
  );
  const [sortBy, setSortBy] = useLocalStorage<SortBy>(
    'ryla-gallery-sort-by',
    'newest'
  );

  // Detail panel state with localStorage persistence
  const [selectedImage, setSelectedImage] = React.useState<StudioImage | null>(
    null
  );
  const [showPanel, setShowPanel] = useLocalStorage(
    'ryla-gallery-show-panel',
    true
  );

  // Mode state
  const [mode, setMode] = useLocalStorage<StudioMode>(
    'ryla-studio-mode',
    'creating'
  );
  const [contentType, setContentType] = useLocalStorage<ContentType>(
    'ryla-studio-content-type',
    'image'
  );

  // Reset variations mode to creating (coming soon)
  React.useEffect(() => {
    if (mode === 'variations') {
      setMode('creating');
    }
  }, [mode, setMode]);

  // Generation state - track active generation jobs
  const [activeGenerations, setActiveGenerations] = React.useState<Set<string>>(
    new Set()
  );

  const [allImages, setAllImages] = React.useState<StudioImage[]>([]);
  const validInfluencers = React.useMemo(
    () => influencers.filter((i) => isUuid(i.id)),
    [influencers]
  );

  // Cleanup stale generating images - mark as failed if stuck for too long
  const cleanupStaleGeneratingImages = React.useCallback(() => {
    const STALE_THRESHOLD_MS = 60 * 1000; // 1 minute
    const now = Date.now();

    setAllImages((prev) => {
      let hasChanges = false;
      const updated = prev.map((img) => {
        // Only check images that are still generating
        if (img.status !== 'generating') return img;

        // Check if image has been generating for too long
        const createdAt = new Date(img.createdAt).getTime();
        const age = now - createdAt;

        if (age > STALE_THRESHOLD_MS) {
          hasChanges = true;
          // Mark as failed
          return { ...img, status: 'failed' as const };
        }

        return img;
      });

      return hasChanges ? updated : prev;
    });
  }, []);

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
        outfit: row.outfit || undefined,
        poseId: row.poseId || undefined,
        aspectRatio: (row.aspectRatio || '9:16') as StudioImage['aspectRatio'],
        status:
          row.status === 'completed'
            ? 'completed'
            : row.status === 'failed'
            ? 'failed'
            : 'generating',
        createdAt: row.createdAt || new Date().toISOString(),
        isLiked: Boolean(row.liked),
        nsfw: row.nsfw ?? false,
        // Prompt enhancement metadata
        promptEnhance: row.promptEnhance ?? undefined,
        originalPrompt: row.originalPrompt || undefined,
        enhancedPrompt: row.enhancedPrompt || undefined,
      }));

      // Replace placeholders with real images - remove all placeholders for this character
      // since real images from DB will have proper IDs and URLs
      setAllImages((prev) => {
        // Keep placeholders for other characters, but remove all for this character
        const placeholdersForOtherChars = prev.filter(
          (img) =>
            img.id.startsWith('placeholder-') &&
            img.influencerId !== characterId
        );

        // Return real images + placeholders for other characters only
        // Real images will replace placeholders naturally since they have different IDs
        const newImages = [...mapped, ...placeholdersForOtherChars];

        // Cleanup stale generating images - mark as failed if stuck for too long
        const STALE_THRESHOLD_MS = 60 * 1000; // 1 minute
        const now = Date.now();
        const cleanedImages = newImages.map((img) => {
          if (img.status !== 'generating') return img;
          const createdAt = new Date(img.createdAt).getTime();
          const age = now - createdAt;
          if (age > STALE_THRESHOLD_MS) {
            return { ...img, status: 'failed' as const };
          }
          return img;
        });

        return cleanedImages;
      });
    },
    [validInfluencers]
  );

  // Track if we've initialized to prevent auto-selection after user explicitly clicks "All Images"
  const hasInitialized = React.useRef(false);

  // Auto-select influencer from query params or first influencer if none selected (only on initial mount)
  React.useEffect(() => {
    // If already initialized, don't auto-select (user may have explicitly selected "All Images")
    if (hasInitialized.current) return;

    // Wait for influencers to load
    if (validInfluencers.length === 0) return;

    if (influencerFromQuery && isUuid(influencerFromQuery)) {
      // Check if the influencer exists in the list
      const influencerExists = validInfluencers.some(
        (i) => i.id === influencerFromQuery
      );
      if (influencerExists) {
        setSelectedInfluencerId(influencerFromQuery);
        hasInitialized.current = true;
        return;
      }
    }

    // Only auto-select first influencer on initial mount if no query param and no selection yet
    // This only runs once on mount, so it won't interfere with user clicking "All Images"
    if (!selectedInfluencerId && validInfluencers[0]?.id) {
      setSelectedInfluencerId(validInfluencers[0].id);
    }

    // Mark as initialized after first run
    hasInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validInfluencers, influencerFromQuery]); // Only depend on influencers and query, not selectedInfluencerId

  React.useEffect(() => {
    if (!selectedInfluencerId) return;
    refreshImages(selectedInfluencerId).catch((err) =>
      console.error('Failed to load images:', err)
    );
  }, [selectedInfluencerId, refreshImages]);

  // Cleanup stale generating images on mount and periodically
  React.useEffect(() => {
    // Run cleanup immediately on mount
    cleanupStaleGeneratingImages();

    // Set up periodic cleanup every 30 seconds
    const interval = setInterval(() => {
      cleanupStaleGeneratingImages();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [cleanupStaleGeneratingImages]);

  // Preselect image from query params and open edit mode if requested
  React.useEffect(() => {
    if (!imageIdFromQuery || allImages.length === 0) return;

    const imageToSelect = allImages.find((img) => img.id === imageIdFromQuery);
    if (imageToSelect) {
      setSelectedImage(imageToSelect);
      setShowPanel(true);

      // Auto-select the influencer associated with the image
      if (
        imageToSelect.influencerId &&
        imageToSelect.influencerId !== selectedInfluencerId
      ) {
        setSelectedInfluencerId(imageToSelect.influencerId);
      }

      // Switch to editing mode if edit=true in query params
      if (shouldOpenEdit) {
        setMode('editing');
      }
    }
  }, [imageIdFromQuery, allImages, shouldOpenEdit, selectedInfluencerId]);

  // Calculate image counts per influencer and sort by most recent image
  // Use imageCount from influencer data (from backend) instead of calculating from allImages
  const influencerTabs = React.useMemo(() => {
    if (!Array.isArray(validInfluencers) || validInfluencers.length === 0) {
      return [];
    }
    const tabs = validInfluencers.map((influencer) => {
      // Get images from allImages for sorting (only if loaded)
      const influencerImages = allImages.filter(
        (img) => img.influencerId === influencer.id
      );
      const mostRecentImage =
        influencerImages.length > 0
          ? influencerImages.reduce((latest, img) => {
              const imgDate = new Date(img.createdAt).getTime();
              const latestDate = new Date(latest.createdAt).getTime();
              return imgDate > latestDate ? img : latest;
            })
          : null;

      return {
        id: influencer.id,
        name: influencer.name,
        avatar: influencer.avatar || undefined,
        imageCount: influencer.imageCount ?? 0, // Use imageCount from backend, not from allImages
        _lastImageDate: mostRecentImage
          ? new Date(mostRecentImage.createdAt).getTime()
          : 0, // Internal use only for sorting
      };
    });

    // Sort by most recent image (most recent first), then by name
    tabs.sort((a, b) => {
      if (b._lastImageDate !== a._lastImageDate) {
        return b._lastImageDate - a._lastImageDate;
      }
      return a.name.localeCompare(b.name);
    });

    // Remove internal sorting property before returning
    return tabs.map(({ _lastImageDate, ...tab }) => tab);
  }, [validInfluencers, allImages]);

  // Calculate total count for "All Images" - sum of all influencer imageCounts
  const totalImageCount = React.useMemo(() => {
    return influencerTabs.reduce((sum, tab) => sum + tab.imageCount, 0);
  }, [influencerTabs]);

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

  // Selected influencer for generation - return null when "All Images" is selected
  const selectedInfluencerForGeneration = React.useMemo(() => {
    if (selectedInfluencerId) {
      return influencerList.find((i) => i.id === selectedInfluencerId) || null;
    }
    return null; // No influencer selected when "All Images" is active
  }, [selectedInfluencerId, influencerList]);

  // Get NSFW enabled status from selected influencer
  const nsfwEnabled = React.useMemo(() => {
    if (!selectedInfluencerId) return false;
    const influencer = validInfluencers.find(
      (i) => i.id === selectedInfluencerId
    );
    return influencer?.nsfwEnabled || false;
  }, [selectedInfluencerId, validInfluencers]);

  // Filter images
  const filteredImages = React.useMemo(() => {
    let result = [...allImages];

    // Filter by influencer
    if (selectedInfluencerId) {
      result = result.filter(
        (img) => img.influencerId === selectedInfluencerId
      );
    }

    // Filter by status
    if (status !== 'all') {
      result = result.filter((img) => img.status === status);
    } else {
      // When showing 'all', exclude failed images by default (they're errored)
      // User can still see them by selecting 'failed' status filter
      result = result.filter((img) => img.status !== 'failed');
    }

    // Filter by aspect ratio
    if (aspectRatios.length > 0) {
      result = result.filter((img) =>
        aspectRatios.includes(img.aspectRatio as AspectRatio)
      );
    }

    // Filter by liked status
    if (liked !== 'all') {
      if (liked === 'liked') {
        result = result.filter((img) => img.isLiked === true);
      } else if (liked === 'not-liked') {
        result = result.filter((img) => img.isLiked === false);
      }
    }

    // Filter by adult content
    if (adult !== 'all') {
      if (adult === 'adult') {
        result = result.filter((img) => img.nsfw === true);
      } else if (adult === 'not-adult') {
        result = result.filter((img) => img.nsfw !== true);
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
  }, [
    allImages,
    selectedInfluencerId,
    status,
    aspectRatios,
    liked,
    adult,
    searchQuery,
    sortBy,
  ]);

  // Handle image selection
  const handleSelectImage = (image: StudioImage | null) => {
    // Prevent errors when selecting generating/failed images
    // Create a safe copy without circular references
    if (image) {
      const safeImage: StudioImage = {
        id: image.id,
        imageUrl: image.imageUrl || '',
        thumbnailUrl: image.thumbnailUrl,
        influencerId: image.influencerId,
        influencerName: image.influencerName,
        influencerAvatar: image.influencerAvatar,
        prompt: image.prompt,
        scene: image.scene,
        environment: image.environment,
        outfit: image.outfit,
        poseId: image.poseId,
        aspectRatio: image.aspectRatio,
        status: image.status,
        createdAt: image.createdAt,
        isLiked: image.isLiked,
        nsfw: image.nsfw,
        promptEnhance: image.promptEnhance,
        originalPrompt: image.originalPrompt,
        enhancedPrompt: image.enhancedPrompt,
      };
      setSelectedImage(safeImage);
      setShowPanel(true);
      // Auto-select the influencer associated with the image
      if (
        safeImage.influencerId &&
        safeImage.influencerId !== selectedInfluencerId
      ) {
        setSelectedInfluencerId(safeImage.influencerId);
      }
    } else {
      setSelectedImage(null);
    }
  };

  // Handle like
  const handleLike = async (imageId: string) => {
    try {
      const res = await likeImage(imageId);
      setAllImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, isLiked: res.liked } : img
        )
      );
      if (selectedImage?.id === imageId) {
        setSelectedImage((prev) =>
          prev ? { ...prev, isLiked: res.liked } : null
        );
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
      a.download = `ryla-${image.influencerName
        .toLowerCase()
        .replace(/\s+/g, '-')}-${image.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Handle retry - regenerate failed image without charging credits
  const handleRetry = async (image: StudioImage) => {
    if (image.status !== 'failed') return;

    const influencer = influencers.find((i) => i.id === image.influencerId);
    if (!influencer) return;

    // Extract prompt from enhanced or original prompt
    const additionalDetails = image.enhancedPrompt
      ? image.enhancedPrompt.replace(image.originalPrompt || '', '').trim()
      : image.prompt || undefined;

    // Determine quality mode from image (default to hq if unknown)
    const qualityMode = 'hq'; // Default, could be inferred from image metadata if stored

    try {
      // Parse outfit - could be string or JSON
      let outfit: string | OutfitComposition =
        image.outfit || influencer.outfit || 'casual';
      try {
        if (typeof image.outfit === 'string' && image.outfit.startsWith('{')) {
          outfit = JSON.parse(image.outfit);
        }
      } catch {
        // Keep as string if parsing fails
      }

      const started = await generateStudioImages({
        characterId: image.influencerId,
        additionalDetails,
        scene: image.scene || 'candid-lifestyle',
        environment: image.environment || 'studio',
        outfit,
        poseId: image.poseId,
        aspectRatio: image.aspectRatio,
        qualityMode,
        count: 1,
        nsfw: image.nsfw ?? false,
        promptEnhance: image.promptEnhance ?? true,
        isRetry: true, // Flag to indicate this is a retry
        retryImageId: image.id, // ID of the failed image
      });

      // Remove the failed image and add placeholder for new generation
      setAllImages((prev) => {
        const filtered = prev.filter((img) => img.id !== image.id);
        const placeholderImages: StudioImage[] = started.jobs.map((job) => ({
          id: `placeholder-${job.promptId}`,
          imageUrl: '',
          influencerId: image.influencerId,
          influencerName: influencer.name || 'Unknown',
          influencerAvatar: influencer.avatar || undefined,
          prompt: image.prompt || additionalDetails,
          scene: image.scene || 'candid-lifestyle',
          environment: image.environment || 'studio',
          outfit: image.outfit,
          aspectRatio: image.aspectRatio,
          status: 'generating' as const,
          createdAt: new Date().toISOString(),
          isLiked: false,
          nsfw: image.nsfw ?? false,
          promptEnhance: image.promptEnhance,
          originalPrompt: image.originalPrompt,
          enhancedPrompt: image.enhancedPrompt,
        }));
        return [...placeholderImages, ...filtered];
      });

      // Track active generations
      const promptIds = started.jobs.map((j) => j.promptId);
      setActiveGenerations((prev) => {
        const next = new Set(prev);
        promptIds.forEach((pid) => next.add(pid));
        return next;
      });

      // Start background polling
      void pollGenerationResults(promptIds, image.influencerId);

      // Clear selected image to show new generation
      setSelectedImage(null);

      // Invalidate activity feed and refresh credits
      utils.activity.list.invalidate();
      utils.activity.summary.invalidate();
      refetchCredits();
    } catch (err) {
      console.error('Retry failed:', err);
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
        additionalDetails: settings.prompt?.trim() || undefined, // User's additional details
        scene: settings.sceneId || 'candid-lifestyle',
        environment: 'studio',
        outfit: settings.outfit || influencer.outfit || 'casual',
        poseId: settings.poseId || undefined,
        lighting: settings.lightingId || undefined,
        aspectRatio,
        qualityMode,
        count: Math.max(1, Math.min(10, settings.batchSize)),
        nsfw: settings.nsfw ?? false, // Use Studio-level NSFW toggle (defaults to false)
        promptEnhance: settings.promptEnhance ?? true, // Use AI prompt enhancement if enabled
      });

      // Create placeholder images immediately
      const placeholderImages: (StudioImage & { _promptId?: string })[] =
        started.jobs.map((job, index) => ({
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
        }));

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
  const pollGenerationResults = async (
    promptIds: string[],
    characterId: string
  ) => {
    const timeoutMs = 3 * 60 * 1000;
    const start = Date.now();
    const completedPromptIds = new Set<string>();

    while (
      Date.now() - start < timeoutMs &&
      completedPromptIds.size < promptIds.length
    ) {
      try {
        // Poll all remaining promptIds
        const remainingPromptIds = promptIds.filter(
          (pid) => !completedPromptIds.has(pid)
        );
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
          totalCount={totalImageCount}
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
          adult={adult}
          onAdultChange={setAdult}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          selectedCount={selectedImage ? 1 : 0}
          onClearSelection={() => setSelectedImage(null)}
        />
      </FadeInUp>

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Gallery */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4">
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

        {/* Right Panel - Detail View (Desktop) */}
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
            onRetry={handleRetry}
            className="hidden w-[380px] flex-shrink-0 lg:flex"
            variant="panel"
          />
        )}

        {/* Mobile Modal - Detail View */}
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
            onRetry={handleRetry}
            className="lg:hidden"
            variant="modal"
          />
        )}
      </div>

      {/* Bottom Generation Bar */}
      <FadeInUp delay={150}>
        <StudioGenerationBar
          influencers={influencerList}
          selectedInfluencer={selectedInfluencerForGeneration}
          onInfluencerChange={(influencerId) => {
            // Sync influencer selection from bottom toolbar to top bar
            setSelectedInfluencerId(influencerId);
          }}
          onGenerate={handleGenerate}
          isGenerating={activeGenerations.size > 0}
          creditsAvailable={creditsBalance}
          selectedImage={selectedImage}
          onClearSelectedImage={() => {
            setSelectedImage(null);
            setShowPanel(false);
            // Switch back to creating mode when clearing selection
            // Objects will be cleared automatically when mode changes
            if (mode !== 'creating') {
              setMode('creating');
            }
          }}
          mode={mode}
          contentType={contentType}
          onModeChange={setMode}
          onContentTypeChange={setContentType}
          nsfwEnabled={nsfwEnabled}
          availableImages={allImages}
          hasUploadConsent={consentData?.hasConsent ?? false}
          onAcceptConsent={async () => {
            await acceptConsentMutation.mutateAsync();
          }}
          onUploadImage={async (file: File): Promise<StudioImage | null> => {
            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

            // Upload via tRPC
            const result = await uploadImageMutation.mutateAsync({
              imageBase64: base64,
              name: file.name,
            });

            // Convert to StudioImage format
            return {
              id: result.id,
              imageUrl: result.imageUrl,
              thumbnailUrl: result.thumbnailUrl,
              influencerId: '', // Not applicable for user uploads
              influencerName: result.name || 'Uploaded Image',
              prompt: result.name || 'Uploaded Image',
              aspectRatio: '1:1', // Default, could be detected
              status: 'completed',
              createdAt: result.createdAt,
              nsfw: false, // Uploaded images are SFW by default
            };
          }}
        />
      </FadeInUp>

      {/* Tutorial Overlay */}
      {tutorial.isActive && (
        <TutorialOverlay
          steps={studioTutorialSteps}
          currentStep={tutorial.currentStep}
          onNext={tutorial.next}
          onSkip={tutorial.skip}
          onComplete={tutorial.complete}
          isVisible={tutorial.isActive}
        />
      )}

      {/* Dev Panel (Development Only) */}
      <DevPanel
        onResetTutorial={(tutorialId) => {
          if (tutorialId === 'studio') {
            tutorial.reset();
          }
        }}
      />
    </div>
  );
}
