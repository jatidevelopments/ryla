'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepAgeRange } from '../../../components/wizard/steps/StepAgeRange';
import { StepBaseImageSelection } from '../../../components/wizard/steps/StepBaseImageSelection';

export default function WizardStep3() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // For prompt-based flow, step 3 is Base Image Selection
  if (creationMethod === 'prompt-based') {
    return <StepBaseImageSelection />;
  }

  // For presets flow, step 3 is Age Range
  if (creationMethod === 'presets') {
    return <StepAgeRange />;
  }

  // Fallback: if no creation method selected, return null
  return null;
}
