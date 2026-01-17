'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepAssSize } from '../../../components/wizard/steps/StepAssSize';
import { StepFinalize } from '../../../components/wizard/steps/StepFinalize';

export default function WizardStep10() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(10);
  }, [setStep]);

  // For prompt-based flow, step 10 is Finalize
  if (creationMethod === 'prompt-based') {
    return <StepFinalize />;
  }

  // For presets flow, step 10 is Ass Size
  if (creationMethod === 'presets') {
    return <StepAssSize />;
  }

  // Fallback: if no creation method selected, return null
  return null;
}
