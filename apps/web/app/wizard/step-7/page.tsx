'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepHairStyle } from '../../../components/wizard/steps/StepHairStyle';

export default function WizardStep7() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(7);
  }, [setStep]);

  // Only presets flow uses step 7 (Hair Style)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepHairStyle />;
}
