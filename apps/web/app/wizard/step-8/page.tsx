'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepIdentity } from '../../../components/wizard/step-identity';

export default function WizardStep8() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(8);
  }, [setStep]);

  // Only presets flow uses step 8 (Identity)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepIdentity />;
}
