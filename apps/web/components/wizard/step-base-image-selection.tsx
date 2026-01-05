'use client';

import * as React from 'react';
import Image from 'next/image';
import { useCharacterWizardStore, type GeneratedImage } from '@ryla/business';
import { Textarea, cn, Checkbox } from '@ryla/ui';
import {
  generateBaseImagesAndWait,
  getBaseImageJobResult,
  type JobStatus,
  type GeneratedImage as APIGeneratedImage,
} from '../../lib/api/character';

/**
 * Step: Base Image Selection
 * Generate 6 base images (2 per model) with skeleton loaders and progressive updates
 * Enhanced UI/UX with fine-tuning support
 */
export function StepBaseImageSelection() {
  const form = useCharacterWizardStore((s) => s.form);
  const baseImages = useCharacterWizardStore((s) => s.baseImages);
  const selectedBaseImageId = useCharacterWizardStore((s) => s.selectedBaseImageId);
  const baseImageFineTunePrompt = useCharacterWizardStore((s) => s.baseImageFineTunePrompt);
  const setBaseImages = useCharacterWizardStore((s) => s.setBaseImages);
  const selectBaseImage = useCharacterWizardStore((s) => s.selectBaseImage);
  const setBaseImageFineTunePrompt = useCharacterWizardStore((s) => s.setBaseImageFineTunePrompt);
  const replaceBaseImage = useCharacterWizardStore((s) => s.replaceBaseImage);
  const setField = useCharacterWizardStore((s) => s.setField);
  // Job ID tracking for prompt-based flow
  const baseImageAllJobIds = useCharacterWizardStore((s) => s.baseImageAllJobIds);
  const clearBaseImageJobIds = useCharacterWizardStore((s) => s.clearBaseImageJobIds);
  const setBaseImageJobIds = useCharacterWizardStore((s) => s.setBaseImageJobIds);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [fineTuningImageId, setFineTuningImageId] = React.useState<string | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = React.useState(false);

  // Generate 6 images (2 per model for variety)
  const expectedImageCount = 6;
  const isPromptBasedFlow = form.creationMethod === 'prompt-based';

  // Ensure baseImages is always an array (defensive check for rehydration)
  const safeBaseImages = Array.isArray(baseImages) ? baseImages : [];

  // Initialize skeleton slots when generation starts
  React.useEffect(() => {
    if (isGenerating && safeBaseImages.length === 0) {
      setCompletedCount(0);
      
      // Create skeleton slots for 6 base images
      const skeletonImages: GeneratedImage[] = [];
      for (let i = 0; i < expectedImageCount; i++) {
        skeletonImages.push({
          id: `skeleton-base-${i}`,
          url: 'skeleton', // Special marker for skeleton state
          thumbnailUrl: 'skeleton',
        });
      }

      setBaseImages(skeletonImages);
    }
  }, [isGenerating, safeBaseImages.length, setBaseImages, expectedImageCount]);

  // Check if we have valid images (not skeletons or loading)
  const hasValidImages = React.useMemo(() => {
    if (!Array.isArray(safeBaseImages) || safeBaseImages.length === 0) {
      return false;
    }
    return safeBaseImages.some(
      (img) => img.url && img.url !== 'skeleton' && img.url !== 'loading' && (img.url.startsWith('http') || img.url.startsWith('data:'))
    );
  }, [safeBaseImages]);

  // Poll existing job IDs for prompt-based flow (resumes generation after navigation/refresh)
  const pollExistingJobs = React.useCallback(async (jobIds: string[]) => {
    if (isPolling || hasValidImages) return;
    
    setIsPolling(true);
    setIsGenerating(true);
    setError(null);
    setCompletedCount(0);

    // Create skeleton slots
    const skeletonImages: GeneratedImage[] = [];
    for (let i = 0; i < expectedImageCount; i++) {
      skeletonImages.push({
        id: `skeleton-base-${i}`,
        url: 'skeleton',
        thumbnailUrl: 'skeleton',
      });
    }
    setBaseImages(skeletonImages);

    const completedImages: GeneratedImage[] = [];
    const pendingJobs = new Set(jobIds);
    const maxWaitTime = 10 * 60 * 1000; // 10 minutes
    const pollInterval = 2000; // 2 seconds
    const startTime = Date.now();

    try {
      while (pendingJobs.size > 0 && Date.now() - startTime < maxWaitTime) {
        // Poll all pending jobs in parallel
        const pollPromises = Array.from(pendingJobs).map(async (jobId) => {
          try {
            const result = await getBaseImageJobResult(jobId);
            return { jobId, result };
          } catch (err) {
            console.error(`Failed to poll job ${jobId}:`, err);
            return { jobId, result: null };
          }
        });

        const results = await Promise.all(pollPromises);

        for (const { jobId, result } of results) {
          if (!result) continue;

          if (result.status === 'completed' && result.images && result.images.length > 0) {
            // Job completed - add images
            result.images.forEach((img: APIGeneratedImage) => {
              completedImages.push(img);
              
              // Update skeleton with actual image
              const currentImages = useCharacterWizardStore.getState().baseImages;
              const safeCurrentImages = Array.isArray(currentImages) ? currentImages : [];
              const skeletonIndex = safeCurrentImages.findIndex(
                (i) => i.url === 'skeleton'
              );
              if (skeletonIndex !== -1) {
                const updatedImages = [...safeCurrentImages];
                updatedImages[skeletonIndex] = img;
                setBaseImages(updatedImages);
              }
            });
            pendingJobs.delete(jobId);
            setCompletedCount((prev) => prev + 1);
          } else if (result.status === 'failed') {
            pendingJobs.delete(jobId);
          }
        }

        // Wait before next poll
        if (pendingJobs.size > 0) {
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }
      }

      if (pendingJobs.size > 0) {
        console.warn(`Some base image jobs timed out: ${Array.from(pendingJobs).join(', ')}`);
      }
    } catch (err) {
      console.error('Polling failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to get generation results');
    } finally {
      setIsPolling(false);
      setIsGenerating(false);
    }
  }, [isPolling, hasValidImages, setBaseImages]);

  // Generate/poll base images on mount
  React.useEffect(() => {
    // Only act if:
    // 1. No valid images exist
    // 2. Not currently generating/polling
    // 3. Not just skeletons (which means generation was interrupted)
    const hasOnlySkeletons = safeBaseImages.length > 0 && safeBaseImages.every(
      (img) => img.url === 'skeleton' || img.url === 'loading'
    );

    const shouldAct = !hasValidImages && !isGenerating && !isPolling && (safeBaseImages.length === 0 || hasOnlySkeletons);
    
    if (!shouldAct) return;

    // For prompt-based flow with existing jobIds: poll those jobs
    if (isPromptBasedFlow && baseImageAllJobIds && baseImageAllJobIds.length > 0) {
      pollExistingJobs(baseImageAllJobIds);
      return;
    }

    // For prompt-based flow without jobIds: start fresh generation if we have a prompt
    // For presets flow: start fresh generation using form presets
    if (isPromptBasedFlow) {
      // Only auto-generate if we have a prompt
      if (form.promptInput?.trim()) {
        handleGenerateAll();
      }
      // If no prompt, user needs to go back - don't auto-generate
    } else {
      // Presets flow: always start generation
      handleGenerateAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidImages, isGenerating, isPolling, safeBaseImages, isPromptBasedFlow, baseImageAllJobIds, form.promptInput]);

  const handleGenerateAll = async (isRegenerate = false) => {
    setIsGenerating(true);
    setError(null);
    setCompletedCount(0);

    // If regenerating, clear existing images first and show fresh skeletons
    if (isRegenerate) {
      setIsRegeneratingAll(true);
      selectBaseImage(null); // Clear selection
      clearBaseImageJobIds(); // Clear any existing job IDs
      
      // Create fresh skeleton slots
      const skeletonImages: GeneratedImage[] = [];
      for (let i = 0; i < expectedImageCount; i++) {
        skeletonImages.push({
          id: `skeleton-base-${i}`,
          url: 'skeleton',
          thumbnailUrl: 'skeleton',
        });
      }
      setBaseImages(skeletonImages);
    }

    try {
      // Build input from form data - check if prompt-based flow
      const isPromptBased = form.creationMethod === 'prompt-based' && form.promptInput;
      
      const input = isPromptBased
        ? {
            // Prompt-based flow
            promptInput: form.promptInput.trim(),
            promptEnhance: form.promptEnhance ?? true,
            nsfwEnabled: form.nsfwEnabled || false,
          }
        : {
            // Traditional presets flow
            appearance: {
              gender: form.gender || 'female',
              style: form.style || 'realistic',
              ethnicity: form.ethnicity || 'caucasian',
              age: form.age,
              ageRange: form.ageRange || undefined,
              skinColor: form.skinColor || undefined,
              eyeColor: form.eyeColor || 'brown',
              faceShape: form.faceShape || undefined,
              hairStyle: form.hairStyle || 'long-straight',
              hairColor: form.hairColor || 'brown',
              bodyType: form.bodyType || 'slim',
              assSize: form.assSize || undefined,
              breastSize: form.breastSize || undefined,
              breastType: form.breastType || undefined,
              freckles: form.freckles || undefined,
              scars: form.scars || undefined,
              beautyMarks: form.beautyMarks || undefined,
              piercings: form.piercings || undefined,
              tattoos: form.tattoos || undefined,
            },
            identity: {
              defaultOutfit: form.outfit || 'casual',
              archetype: form.archetype || 'girl-next-door',
              personalityTraits:
                form.personalityTraits.length > 0
                  ? form.personalityTraits
                  : ['friendly'],
              bio: form.bio,
            },
            nsfwEnabled: form.nsfwEnabled,
          };

      // Generate with progressive callback - don't await, images come via callback
      generateBaseImagesAndWait(
        input,
        (status: JobStatus) => {
          // Progress updates
          if (status === 'completed') {
            setIsGenerating(false);
            setIsRegeneratingAll(false);
          } else if (status === 'failed') {
            setIsGenerating(false);
            setIsRegeneratingAll(false);
          }
        },
        (image: GeneratedImage, index: number) => {
          // Called when each image completes - update progressively
          // Get current images from store
          const currentImages = useCharacterWizardStore.getState().baseImages;
          const safeCurrentImages = Array.isArray(currentImages) ? currentImages : [];
          
          // Find the first available skeleton slot (not tied to specific index)
          const skeletonIndex = safeCurrentImages.findIndex(
            (img) => img.url === 'skeleton'
          );

          if (skeletonIndex !== -1) {
            // Replace skeleton with actual image
            const updatedImages = [...safeCurrentImages];
            updatedImages[skeletonIndex] = image;
            setBaseImages(updatedImages);
          } else {
            // If no skeleton found, we might have already replaced all - just add
            // But this shouldn't happen if we initialized skeletons correctly
            setBaseImages([...safeCurrentImages, image]);
          }

          setCompletedCount((prev) => {
            const newCount = prev + 1;
            // If all images are done, stop generating state
            if (newCount >= expectedImageCount) {
              setIsGenerating(false);
              setIsRegeneratingAll(false);
            }
            return newCount;
          });
        }
      ).catch((err) => {
        console.error('Generation failed:', err);
        setError(err instanceof Error ? err.message : 'Generation failed');
        setIsGenerating(false);
        setIsRegeneratingAll(false);
      });
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
      setIsRegeneratingAll(false);
    }
  };

  const handleRegenerateImage = async (imageId: string, fineTuneAdjustment?: string) => {
    const image = safeBaseImages.find((img) => img.id === imageId);
    if (!image) return;

    setFineTuningImageId(imageId);
    setError(null);

    // Set loading state
    replaceBaseImage(imageId, { ...image, url: 'loading', thumbnailUrl: 'loading' });

    try {
      const isPromptBased = form.creationMethod === 'prompt-based' && form.promptInput;
      
      // Build input based on flow type
      let input: any;
      
      if (isPromptBased) {
        // For prompt-based flow, append fine-tune adjustment to the original prompt
        let prompt = form.promptInput.trim();
        if (fineTuneAdjustment?.trim()) {
          prompt = `${prompt}. Additional adjustments: ${fineTuneAdjustment.trim()}`;
        }
        
        input = {
          promptInput: prompt,
          promptEnhance: form.promptEnhance ?? true,
          nsfwEnabled: form.nsfwEnabled || false,
        };
      } else {
        // For presets flow, use appearance/identity data
        input = {
          appearance: {
            gender: form.gender || 'female',
            style: form.style || 'realistic',
            ethnicity: form.ethnicity || 'caucasian',
            age: form.age,
            ageRange: form.ageRange || undefined,
            skinColor: form.skinColor || undefined,
            eyeColor: form.eyeColor || 'brown',
            faceShape: form.faceShape || undefined,
            hairStyle: form.hairStyle || 'long-straight',
            hairColor: form.hairColor || 'brown',
            bodyType: form.bodyType || 'slim',
            assSize: form.assSize || undefined,
            breastSize: form.breastSize || undefined,
            breastType: form.breastType || undefined,
            freckles: form.freckles || undefined,
            scars: form.scars || undefined,
            beautyMarks: form.beautyMarks || undefined,
            piercings: form.piercings || undefined,
            tattoos: form.tattoos || undefined,
          },
          identity: {
            defaultOutfit: form.outfit || 'casual',
            archetype: form.archetype || 'girl-next-door',
            personalityTraits:
              form.personalityTraits.length > 0
                ? form.personalityTraits
                : ['friendly'],
            bio: form.bio,
          },
          nsfwEnabled: form.nsfwEnabled,
          // Add fine-tune adjustment to bio for presets flow (will be included in prompt)
          ...(fineTuneAdjustment?.trim() && {
            promptInput: fineTuneAdjustment.trim(),
            promptEnhance: false, // Don't double-enhance
          }),
        };
      }

      // Generate single image (will return array with one image)
      const images = await generateBaseImagesAndWait(input, (status: JobStatus) => {
        // Progress updates
      });

      if (images.length > 0) {
        // Replace the specific image
        replaceBaseImage(imageId, images[0]);
        // If this was selected, update selection
        if (selectedBaseImageId === imageId) {
          selectBaseImage(images[0].id);
        }
      }
    } catch (err) {
      console.error('Regeneration failed:', err);
      setError(err instanceof Error ? err.message : 'Regeneration failed');
      // Revert to original image on error
      replaceBaseImage(imageId, image);
    } finally {
      setFineTuningImageId(null);
    }
  };

  const handleFineTuneAndRegenerate = async () => {
    if (!selectedBaseImageId) return;
    
    // Pass the fine-tune prompt to regeneration
    await handleRegenerateImage(selectedBaseImageId, baseImageFineTunePrompt);
    
    // Clear the fine-tune prompt after regeneration
    setBaseImageFineTunePrompt('');
  };

  const skeletonImages = safeBaseImages.filter((img) => img.url === 'skeleton');
  const loadingImages = safeBaseImages.filter((img) => img.url === 'loading');
  const hasImages = safeBaseImages.some(
    (img) => img.url && img.url !== 'skeleton' && img.url !== 'loading' && (img.url.startsWith('http') || img.url.startsWith('data:'))
  );

  // For prompt-based flow: check if we have jobIds to poll
  const missingJobIds = isPromptBasedFlow && (!baseImageAllJobIds || baseImageAllJobIds.length === 0) && !hasValidImages && !isGenerating && !isPolling;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8 w-full">
        <p className="text-white/60 text-sm font-medium mb-2">Base Image Selection</p>
        <h1 className="text-white text-2xl font-bold mb-2">
          Choose Your Character Face
        </h1>
        {isGenerating || skeletonImages.length > 0 ? (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-white/60 text-sm">
              Generating {completedCount}/{expectedImageCount} images...
            </p>
          </div>
        ) : (
          <p className="text-white/40 text-sm mt-2">
            Select one image, or fine-tune and regenerate
          </p>
        )}
      </div>

      {/* Missing jobIds warning for prompt-based flow */}
      {missingJobIds && (
        <div className="w-full mb-6">
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5">
                <path
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="text-orange-300 font-medium mb-1">Generation not started</p>
                <p className="text-white/60 text-sm mb-3">
                  Please go back to the prompt input step and click Continue to start generating your character images.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-300 text-sm font-medium hover:bg-orange-500/30 transition-colors"
                >
                  ← Go Back to Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid with Skeleton Loaders - 3x2 grid for 6 images */}
      <div className="w-full mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Show existing images or skeletons */}
          {!missingJobIds && safeBaseImages.length > 0 ? (
            safeBaseImages.map((image, index) => {
              const isSelected = selectedBaseImageId === image.id;
              const isRegenerating = fineTuningImageId === image.id || image.url === 'loading';
              const isSkeleton = image.url === 'skeleton';

              return (
                <BaseImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  isSelected={isSelected}
                  isRegenerating={isRegenerating}
                  isSkeleton={isSkeleton}
                  onSelect={() => !isSkeleton && !isRegenerating && selectBaseImage(image.id)}
                  onRegenerate={() => handleRegenerateImage(image.id)}
                />
              );
            })
          ) : !missingJobIds ? (
            // Show skeleton placeholders if no images yet (6 images)
            Array.from({ length: expectedImageCount }).map((_, index) => (
              <BaseImageCard
                key={`placeholder-${index}`}
                image={{ id: `placeholder-${index}`, url: 'skeleton', thumbnailUrl: 'skeleton' }}
                index={index}
                isSelected={false}
                isRegenerating={false}
                isSkeleton={true}
                onSelect={() => {}}
                onRegenerate={() => {}}
              />
            ))
          ) : null}
        </div>
      </div>

      {/* Fine-Tuning Section */}
      {selectedBaseImageId && (
        <div className="w-full mb-4">
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-purple-400">
                <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <p className="text-white/70 text-sm font-medium">
                Fine-tune Selected Image
              </p>
            </div>
            <Textarea
              value={baseImageFineTunePrompt}
              onChange={(e) => setBaseImageFineTunePrompt(e.target.value)}
              placeholder="Describe adjustments, e.g., 'make eyes brighter', 'softer expression', 'warmer lighting', 'add subtle smile'..."
              className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-purple-500/50 focus:ring-purple-500/20 text-sm"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-white/30 text-xs">{baseImageFineTunePrompt.length}/500</span>
            </div>
            <button
              onClick={handleFineTuneAndRegenerate}
              disabled={isGenerating || fineTuningImageId !== null || !baseImageFineTunePrompt.trim()}
              className={cn(
                "mt-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden",
                baseImageFineTunePrompt.trim() && !isGenerating && fineTuningImageId === null
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              )}
            >
              {fineTuningImageId === selectedBaseImageId ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Regenerating...
                </span>
              ) : (
                'Regenerate with Adjustments'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Regenerate All Button */}
      <div className="w-full">
        <button
          onClick={() => handleGenerateAll(true)}
          disabled={isGenerating || isRegeneratingAll}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
            isGenerating || isRegeneratingAll
              ? "bg-white/5 text-white/40 cursor-not-allowed"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          {isRegeneratingAll ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Regenerating All...
            </span>
          ) : (
            'Regenerate All'
          )}
        </button>
      </div>

      {error && (
        <div className="w-full mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!hasImages && !isGenerating && safeBaseImages.length === 0 && (
        <div className="w-full text-center py-12">
          <p className="text-white/60 text-sm mb-4">No base images generated yet</p>
          <button
            onClick={handleGenerateAll}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            Generate Base Images
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Base Image Card Component with Skeleton Loading
 */
interface BaseImageCardProps {
  image: GeneratedImage;
  index: number;
  isSelected: boolean;
  isRegenerating: boolean;
  isSkeleton: boolean;
  onSelect: () => void;
  onRegenerate: () => void;
}

function BaseImageCard({
  image,
  index,
  isSelected,
  isRegenerating,
  isSkeleton,
  onSelect,
  onRegenerate,
}: BaseImageCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  if (isSkeleton) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-white/10 bg-white/5">
        <div className="relative aspect-square">
          {/* Skeleton Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
          
          {/* Loading Indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>

          {/* Image Number Label */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
            <div className="h-3 w-16 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer',
        isSelected
          ? 'border-purple-400 ring-2 ring-purple-400/30'
          : 'border-white/10 hover:border-white/20',
        isRegenerating && 'opacity-60'
      )}
      onMouseEnter={() => !isRegenerating && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-square bg-white/5">
        {isRegenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Image
              src={image.url}
              alt={`Base image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Image Number + Model Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2.5">
              <p className="text-white text-xs font-semibold">
                Image {index + 1}{image.model ? ` - ${image.model}` : ''}
              </p>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center ring-2 ring-purple-500/30">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4 text-white"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Actions Overlay */}
            {showActions && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors backdrop-blur-sm',
                    isSelected
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  )}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  Regenerate
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
