'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepPersonality } from '../../../components/wizard/steps/StepPersonality';

export default function WizardStep20() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(20);
  }, [setStep]);

  // Only presets flow uses step 20 (Personality)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepPersonality />;
}
