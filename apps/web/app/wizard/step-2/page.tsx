'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepEthnicity } from '../../../components/wizard/steps/StepEthnicity';
import { StepIdentity } from '../../../components/wizard/steps/StepIdentity';

export default function WizardStep2() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  // For prompt-based flow, step 2 is Identity
  if (creationMethod === 'prompt-based') {
    return <StepIdentity />;
  }

  // For presets flow, step 2 is Ethnicity
  if (creationMethod === 'presets') {
    return <StepEthnicity />;
  }

  // Fallback: if no creation method selected, return null
  return null;
}
