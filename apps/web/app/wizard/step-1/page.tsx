'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepStyle } from '../../../components/wizard/step-style';
import { StepPromptInput } from '../../../components/wizard/step-prompt-input';
import { StepCustomPrompts } from '../../../components/wizard/step-custom-prompts';
import { StepInfluencerRequest } from '../../../components/wizard/step-influencer-request';

export default function WizardStep1() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  // Render different step based on creation method
  if (creationMethod === 'prompt-based') {
    return <StepPromptInput />;
  } else if (creationMethod === 'custom') {
    return <StepCustomPrompts />;
  } else if (creationMethod === 'existing-person') {
    return <StepInfluencerRequest />;
  } else {
    // Default to presets flow
    return <StepStyle />;
  }
}
