'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepBodyModifications } from '@/components/wizard/steps/StepBodyModifications';

export default function WizardStep7() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(7);
  }, [setStep]);

  // Only presets flow uses step 7 (Body Modifications)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepBodyModifications />;
}
