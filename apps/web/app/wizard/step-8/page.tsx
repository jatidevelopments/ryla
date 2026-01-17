'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepHairColor } from '../../../components/wizard/steps/StepHairColor';

export default function WizardStep8() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(8);
  }, [setStep]);

  // Only presets flow uses step 8 (Hair Color)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepHairColor />;
}
