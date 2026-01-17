'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepPiercings } from '../../../components/wizard/steps/StepPiercings';

export default function WizardStep16() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(16);
  }, [setStep]);

  // Only presets flow uses step 16 (Piercings)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepPiercings />;
}
