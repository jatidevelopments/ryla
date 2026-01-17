'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepBaseImageSelection } from '../../../components/wizard/steps/StepBaseImageSelection';

export default function WizardStep21() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(21);
  }, [setStep]);

  // Only presets flow uses step 21 (Base Image Selection)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepBaseImageSelection />;
}
