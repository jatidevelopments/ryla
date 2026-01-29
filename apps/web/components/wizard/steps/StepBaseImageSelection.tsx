'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { useBaseImageGeneration } from '../hooks/use-base-image-generation';
import { useBaseImageInitialization } from '../hooks/use-base-image-initialization';
import { useBaseImageHandlers } from '../hooks/use-base-image-handlers';
import {
  BaseImageHeader,
  MissingJobIdsWarning,
  BaseImageGrid,
  FineTuneSection,
  RegenerateAllButton,
  BaseImageError,
  BaseImageEmptyState,
} from '../components';

/**
 * Step: Base Image Selection
 * Generate 6 base images (2 per model) with skeleton loaders and progressive updates
 * Enhanced UI/UX with fine-tuning support
 */
export function StepBaseImageSelection() {
  const form = useCharacterWizardStore((s) => s.form);
  const isPromptBasedFlow = form.creationMethod === 'prompt-based';

  // Generation logic hook
  const {
    isGenerating,
    isPolling,
    completedCount,
    error,
    connectionError,
    isRegeneratingAll,
    hasValidImages,
    expectedImageCount,
    pollExistingJobs,
    handleGenerateAll,
    handleRegenerateImage,
  } = useBaseImageGeneration();

  // Handlers and computed values hook (needed first for safeBaseImages)
  const {
    fineTuningImageId,
    safeBaseImages,
    skeletonImages,
    hasImages,
    selectedBaseImageId,
    baseImageFineTunePrompt,
    setBaseImageFineTunePrompt,
    selectBaseImage,
    handleRegenerateSingleImage,
    handleFineTuneAndRegenerate,
  } = useBaseImageHandlers({
    handleRegenerateImage,
  });

  // Initialization logic hook (uses safeBaseImages from handlers hook)
  const { missingJobIds } = useBaseImageInitialization({
    isPromptBasedFlow,
    hasValidImages,
    isGenerating,
    isPolling,
    safeBaseImages,
    pollExistingJobs,
    handleGenerateAll,
  });

  return (
    <div className="flex flex-col items-center w-full">
      <BaseImageHeader
        isGenerating={isGenerating}
        hasSkeletonImages={skeletonImages.length > 0}
        completedCount={completedCount}
        expectedImageCount={expectedImageCount}
      />

      {missingJobIds && <MissingJobIdsWarning />}

      <BaseImageGrid
        images={safeBaseImages}
        expectedImageCount={expectedImageCount}
        selectedBaseImageId={selectedBaseImageId}
        fineTuningImageId={fineTuningImageId}
        missingJobIds={missingJobIds}
        onSelectImage={selectBaseImage}
        onRegenerateImage={handleRegenerateSingleImage}
      />

      <FineTuneSection
        selectedImageId={selectedBaseImageId}
        fineTunePrompt={baseImageFineTunePrompt}
        onFineTunePromptChange={setBaseImageFineTunePrompt}
        onRegenerate={handleFineTuneAndRegenerate}
        isGenerating={isGenerating}
        fineTuningImageId={fineTuningImageId}
      />

      <RegenerateAllButton
        onRegenerateAll={() => handleGenerateAll(true, true)}
        isGenerating={isGenerating}
        isRegeneratingAll={isRegeneratingAll}
      />

      <BaseImageError 
        error={error} 
        connectionError={connectionError}
        onRetry={() => handleGenerateAll(false, true)}
      />

      <BaseImageEmptyState
        hasImages={hasImages}
        isGenerating={isGenerating}
        hasImagesInStore={safeBaseImages.length > 0}
        onGenerate={() => handleGenerateAll(false, true)}
      />
    </div>
  );
}
