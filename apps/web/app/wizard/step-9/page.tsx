'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepBodyType } from '../../../components/wizard/steps/StepBodyType';

export default function WizardStep9() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(9);
  }, [setStep]);

  // Only presets flow uses step 9 (Body Type)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepBodyType />;
}

