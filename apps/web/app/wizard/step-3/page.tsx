'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepFace } from '../../../components/wizard/step-face';

export default function WizardStep3() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // Only presets flow uses step 3 (Facial Features)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepFace />;
}
