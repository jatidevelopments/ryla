'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { useCredits } from '../../lib/hooks/use-credits';
import { ZeroCreditsModal } from '../credits';
import { FEATURE_CREDITS } from '../../constants/pricing';
import { useWizardGeneration } from './hooks/use-wizard-generation';
import {
  GenerateLoadingState,
  GenerateErrorState,
  GenerateHeader,
  CharacterSummary,
  GenerationSettings,
  GenerateButton,
} from './components';

/**
 * Step 6: Generate
 * Preview settings and create the AI influencer
 */
const BASE_IMAGE_CREDITS = FEATURE_CREDITS.base_images.credits;

export function StepGenerate() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  // Credit management
  const { balance, isLoading: isLoadingCredits, refetch: refetchCredits } = useCredits();
  const [showCreditModal, setShowCreditModal] = React.useState(false);

  // Calculate cost based on quality mode
  const creditCost = form.qualityMode === 'hq' ? BASE_IMAGE_CREDITS * 2 : BASE_IMAGE_CREDITS;
  const hasEnoughCredits = balance >= creditCost;

  // Generation logic hook
  const { isGenerating, generationStatus, error, handleGenerate, handleRetry } =
    useWizardGeneration({
      balance,
      creditCost,
      hasEnoughCredits,
      onShowCreditModal: () => setShowCreditModal(true),
      onRefetchCredits: refetchCredits,
    });

  // Build summary items
  const summaryItems = React.useMemo(
    () =>
      [
        { label: 'Gender', value: form.gender },
        { label: 'Style', value: form.style },
        { label: 'Ethnicity', value: form.ethnicity },
        { label: 'Age', value: form.age },
        {
          label: 'Hair',
          value: `${form.hairColor || ''} ${form.hairStyle || ''}`.trim(),
        },
        { label: 'Eyes', value: form.eyeColor },
        { label: 'Body', value: form.bodyType },
      ].filter((item) => item.value),
    [form]
  );

  if (isGenerating) {
    return <GenerateLoadingState status={generationStatus} />;
  }

  if (error) {
    return <GenerateErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="flex flex-col items-center">
      <GenerateHeader name={form.name || 'Your AI Influencer'} personalityTraits={form.personalityTraits} />
      <CharacterSummary items={summaryItems} />
      <GenerationSettings
        aspectRatio={form.aspectRatio || '1:1'}
        qualityMode={form.qualityMode || 'draft'}
        nsfwEnabled={form.nsfwEnabled}
        onAspectRatioChange={(ratio) => setField('aspectRatio', ratio)}
        onQualityModeChange={(checked) => setField('qualityMode', checked ? 'hq' : 'draft')}
        onNsfwChange={(checked) => setField('nsfwEnabled', checked)}
      />
      <GenerateButton
        creditCost={creditCost}
        balance={balance}
        hasEnoughCredits={hasEnoughCredits}
        isLoadingCredits={isLoadingCredits}
        onGenerate={handleGenerate}
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
