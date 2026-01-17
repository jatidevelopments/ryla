'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepFaceShape } from '../../../components/wizard/steps/StepFaceShape';

export default function WizardStep6() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  // Only presets flow uses step 6 (Face Shape)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepFaceShape />;
}
