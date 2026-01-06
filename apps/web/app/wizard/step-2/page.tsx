'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepGeneral } from '../../../components/wizard/steps/StepGeneral';
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

  // For presets flow, step 2 is Basic Appearance
  if (creationMethod === 'presets') {
    return <StepGeneral />;
  }

  // Fallback: if no creation method selected, return null
  return null;
}
