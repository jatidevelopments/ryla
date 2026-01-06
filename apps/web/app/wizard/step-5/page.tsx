'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepBody } from '../../../components/wizard/steps/StepBody';

export default function WizardStep5() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(5);
  }, [setStep]);

  // Only presets flow uses step 5 (Body)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepBody />;
}
