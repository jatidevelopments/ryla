'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepGeneral } from '../../../components/wizard/step-general';

export default function WizardStep2() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  // Only presets flow uses step 2 (Basic Appearance)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepGeneral />;
}
