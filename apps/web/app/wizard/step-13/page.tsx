'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepFreckles } from '../../../components/wizard/steps/StepFreckles';

export default function WizardStep13() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(13);
  }, [setStep]);

  // Only presets flow uses step 13 (Freckles)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepFreckles />;
}
