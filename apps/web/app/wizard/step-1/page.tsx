'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepStyle } from '../../../components/wizard/step-style';
import { StepAIDescription } from '../../../components/wizard/step-ai-description';
import { StepCustomPrompts } from '../../../components/wizard/step-custom-prompts';

export default function WizardStep1() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  // Render different step based on creation method
  if (creationMethod === 'ai') {
    return <StepAIDescription />;
  } else if (creationMethod === 'custom') {
    return <StepCustomPrompts />;
  } else {
    // Default to presets flow
    return <StepStyle />;
  }
}
