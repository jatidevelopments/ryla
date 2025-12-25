'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepStyle } from '../../../components/wizard/step-style';
import { StepPromptInput } from '../../../components/wizard/step-prompt-input';

export default function WizardStep1() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  // Render different step based on creation method
  if (creationMethod === 'prompt-based') {
    return <StepPromptInput />;
  } else {
    // Default to presets flow
    return <StepStyle />;
  }
}
