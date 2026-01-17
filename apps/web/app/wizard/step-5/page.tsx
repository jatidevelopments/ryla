'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepEyeColor } from '../../../components/wizard/steps/StepEyeColor';

export default function WizardStep5() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(5);
  }, [setStep]);

  // Only presets flow uses step 5 (Eye Color)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepEyeColor />;
}
