'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepArchetype } from '../../../components/wizard/steps/StepArchetype';

export default function WizardStep19() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(19);
  }, [setStep]);

  // Only presets flow uses step 19 (Archetype)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepArchetype />;
}
