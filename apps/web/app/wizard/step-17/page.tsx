'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepTattoos } from '../../../components/wizard/steps/StepTattoos';

export default function WizardStep17() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(17);
  }, [setStep]);

  // Only presets flow uses step 17 (Tattoos)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepTattoos />;
}
