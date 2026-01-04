'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepHair } from '../../../components/wizard/step-hair';

export default function WizardStep4() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  // Only presets flow uses step 4 (Hair)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepHair />;
}
