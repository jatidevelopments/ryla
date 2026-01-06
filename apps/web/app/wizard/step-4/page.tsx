'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepHair } from '../../components/wizard/steps/StepHair';
import { StepFinalize } from '../../components/wizard/steps/StepFinalize';

export default function WizardStep4() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  // For prompt-based flow, step 4 is Finalize
  if (creationMethod === 'prompt-based') {
    return <StepFinalize />;
  }

  // For presets flow, step 4 is Hair
  if (creationMethod === 'presets') {
    return <StepHair />;
  }

  // Fallback: if no creation method selected, return null
  return null;
}
