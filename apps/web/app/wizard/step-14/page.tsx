'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepScars } from '../../../components/wizard/steps/StepScars';

export default function WizardStep14() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(14);
  }, [setStep]);

  // Only presets flow uses step 14 (Scars)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepScars />;
}
