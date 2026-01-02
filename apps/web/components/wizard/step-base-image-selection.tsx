'use client';

import * as React from 'react';
import Image from 'next/image';
import { useCharacterWizardStore, type GeneratedImage } from '@ryla/business';
import { Textarea, cn, Checkbox } from '@ryla/ui';
import {
  generateBaseImagesAndWait,
  type JobStatus,
} from '../../lib/api/character';

/**
 * Step: Base Image Selection
 * Generate 3 base images with skeleton loaders and progressive updates
 * Same UI/UX as profile pictures step
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

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [fineTuningImageId, setFineTuningImageId] = React.useState<string | null>(null);

  const expectedImageCount = 3;

  // Ensure baseImages is always an array (defensive check for rehydration)
  const safeBaseImages = Array.isArray(baseImages) ? baseImages : [];

  // Initialize skeleton slots when generation starts
  React.useEffect(() => {
    if (isGenerating && safeBaseImages.length === 0) {
      setCompletedCount(0);
      
      // Create skeleton slots for 3 base images
      const skeletonImages: GeneratedImage[] = [];
      for (let i = 0; i < 3; i++) {
        skeletonImages.push({
          id: `skeleton-base-${i}`,
          url: 'skeleton', // Special marker for skeleton state
          thumbnailUrl: 'skeleton',
        });
      }

      setBaseImages(skeletonImages);
    }
  }, [isGenerating, baseImages.length, setBaseImages]);

  // Check if we have valid images (not skeletons or loading)
  const hasValidImages = React.useMemo(() => {
    if (!Array.isArray(safeBaseImages) || safeBaseImages.length === 0) {
      return false;
    }
    return safeBaseImages.some(
      (img) => img.url && img.url !== 'skeleton' && img.url !== 'loading' && (img.url.startsWith('http') || img.url.startsWith('data:'))
    );
  }, [safeBaseImages]);

  // Generate base images on mount if not already generated
  // Also check when component becomes visible again (e.g., navigating back)
  React.useEffect(() => {
    // Only generate if:
    // 1. No valid images exist
    // 2. Not currently generating
    // 3. Not just skeletons (which means generation was interrupted)
    const hasOnlySkeletons = safeBaseImages.length > 0 && safeBaseImages.every(
      (img) => img.url === 'skeleton' || img.url === 'loading'
    );

    // Check if we need to generate
    const shouldGenerate = !hasValidImages && !isGenerating && (safeBaseImages.length === 0 || hasOnlySkeletons);
    
    if (shouldGenerate) {
      handleGenerateAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidImages, isGenerating, safeBaseImages]);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setError(null);
    setCompletedCount(0);

    try {
      // Build input from form data
      const input = {
        appearance: {
          gender: form.gender || 'female',
          style: form.style || 'realistic',
          ethnicity: form.ethnicity || 'caucasian',
          age: form.age,
          hairStyle: form.hairStyle || 'long-straight',
          hairColor: form.hairColor || 'brown',
          eyeColor: form.eyeColor || 'brown',
          bodyType: form.bodyType || 'slim',
          breastSize: form.breastSize || undefined,
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
          } else if (status === 'failed') {
            setIsGenerating(false);
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
            }
            return newCount;
          });
        }
      ).catch((err) => {
        console.error('Generation failed:', err);
        setError(err instanceof Error ? err.message : 'Generation failed');
        setIsGenerating(false);
      });
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
    }
  };

  const handleRegenerateImage = async (imageId: string) => {
    const image = safeBaseImages.find((img) => img.id === imageId);
    if (!image) return;

    setFineTuningImageId(imageId);
    setError(null);

    // Set loading state
    replaceBaseImage(imageId, { ...image, url: 'loading', thumbnailUrl: 'loading' });

    try {
      // Build input with fine-tune prompt if available
      const input = {
        appearance: {
          gender: form.gender || 'female',
          style: form.style || 'realistic',
          ethnicity: form.ethnicity || 'caucasian',
          age: form.age,
          hairStyle: form.hairStyle || 'long-straight',
          hairColor: form.hairColor || 'brown',
          eyeColor: form.eyeColor || 'brown',
          bodyType: form.bodyType || 'slim',
          breastSize: form.breastSize || undefined,
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

  const handleFineTuneAndRegenerate = async (imageId: string) => {
    if (!baseImageFineTunePrompt.trim()) {
      // If no fine-tune prompt, just regenerate
      await handleRegenerateImage(imageId);
      return;
    }

    // TODO: Implement fine-tuning with prompt adjustment
    // For now, just regenerate
    await handleRegenerateImage(imageId);
  };

  const skeletonImages = safeBaseImages.filter((img) => img.url === 'skeleton');
  const loadingImages = safeBaseImages.filter((img) => img.url === 'loading');
  const hasImages = safeBaseImages.some(
    (img) => img.url && img.url !== 'skeleton' && img.url !== 'loading' && (img.url.startsWith('http') || img.url.startsWith('data:'))
  );

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

      {/* Image Grid with Skeleton Loaders */}
      <div className="w-full mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Show existing images or skeletons */}
          {safeBaseImages.length > 0 ? (
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
          ) : (
            // Show skeleton placeholders if no images yet
            Array.from({ length: 3 }).map((_, index) => (
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
          )}
        </div>
      </div>

      {/* Fine-Tuning Section */}
      {selectedBaseImageId && (
        <div className="w-full mb-4">
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-3">
              Fine-tune Selected Image (Optional)
            </p>
            <Textarea
              value={baseImageFineTunePrompt}
              onChange={(e) => setBaseImageFineTunePrompt(e.target.value)}
              placeholder="Add adjustments to the prompt, e.g., 'make eyes brighter', 'softer expression', 'different lighting'..."
              className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-purple-500/50 focus:ring-purple-500/20"
              maxLength={500}
            />
            <button
              onClick={() => handleFineTuneAndRegenerate(selectedBaseImageId)}
              disabled={isGenerating || fineTuningImageId !== null || !selectedBaseImageId}
              className="mt-3 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Regenerate with Adjustments
            </button>
          </div>
        </div>
      )}

      {/* Regenerate All Button */}
      <div className="w-full">
        <button
          onClick={handleGenerateAll}
          disabled={isGenerating}
          className="w-full px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Regenerate All'}
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

            {/* Image Number Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2.5">
              <p className="text-white text-xs font-semibold">Image {index + 1}</p>
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
