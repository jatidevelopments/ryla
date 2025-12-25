'use client';

import * as React from 'react';
import Image from 'next/image';
import { useCharacterWizardStore } from '@ryla/business';
import { Textarea, cn } from '@ryla/ui';
import {
  generateBaseImagesAndWait,
  type JobStatus,
  type GeneratedImage,
} from '../../lib/api/character';

/**
 * Step: Base Image Selection
 * Generate 3 base images, allow selection and fine-tuning
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
  const setStatus = useCharacterWizardStore((s) => s.setStatus);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStatus, setGenerationStatus] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [fineTuningImageId, setFineTuningImageId] = React.useState<string | null>(null);

  // Generate base images on mount if not already generated
  React.useEffect(() => {
    if (baseImages.length === 0 && !isGenerating) {
      handleGenerateAll();
    }
  }, []);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setStatus('generating');
    setError(null);
    setGenerationStatus('Generating base images...');

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

      const images = await generateBaseImagesAndWait(
        input,
        (status: JobStatus) => {
          switch (status) {
            case 'queued':
              setGenerationStatus('Queued for processing...');
              break;
            case 'in_progress':
              setGenerationStatus('Generating your character face...');
              break;
            case 'completed':
              setGenerationStatus('Complete!');
              break;
            default:
              setGenerationStatus('Processing...');
          }
        }
      );

      setBaseImages(images);
      setStatus('idle');
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImage = async (imageId: string) => {
    const image = baseImages.find((img) => img.id === imageId);
    if (!image) return;

    setIsGenerating(true);
    setFineTuningImageId(imageId);
    setError(null);
    setGenerationStatus('Regenerating image...');

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

      // Generate single image (API will need to support this)
      const images = await generateBaseImagesAndWait(input, (status: JobStatus) => {
        setGenerationStatus('Regenerating...');
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
    } finally {
      setIsGenerating(false);
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

  if (isGenerating && baseImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-purple-400"
            >
              <path
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Creating Your Character Face
        </h2>
        <p className="text-white/60 text-sm">{generationStatus || 'This may take a minute...'}</p>
      </div>
    );
  }

  if (error && baseImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-red-400">
            <path
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Generation Failed</h2>
        <p className="text-white/60 text-sm mb-6 text-center max-w-xs">{error}</p>
        <button
          onClick={handleGenerateAll}
          className="px-6 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-white/60 text-sm font-medium mb-2">Base Image Selection</p>
        <h1 className="text-white text-2xl font-bold">
          Choose Your Character Face
        </h1>
        <p className="text-white/40 text-sm mt-2">
          Select one image, or fine-tune and regenerate
        </p>
      </div>

      {/* Image Grid */}
      <div className="w-full mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {baseImages.map((image, index) => {
            const isSelected = selectedBaseImageId === image.id;
            const isRegenerating = fineTuningImageId === image.id;

            return (
              <div
                key={image.id}
                className={cn(
                  'relative group rounded-2xl overflow-hidden border-2 transition-all',
                  isSelected
                    ? 'border-purple-400 ring-2 ring-purple-400/30'
                    : 'border-white/10 hover:border-white/20'
                )}
              >
                {/* Image */}
                <div className="relative aspect-square bg-white/5">
                  {isRegenerating ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <Image
                      src={image.url}
                      alt={`Base image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}

                  {/* Selection Indicator */}
                  {isSelected && !isRegenerating && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
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

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => selectBaseImage(image.id)}
                      disabled={isSelected || isRegenerating}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      )}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => handleRegenerateImage(image.id)}
                      disabled={isRegenerating}
                      className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors"
                    >
                      {isRegenerating ? 'Generating...' : 'Regenerate'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
              disabled={isGenerating || !selectedBaseImageId}
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

      {error && baseImages.length > 0 && (
        <div className="w-full mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

