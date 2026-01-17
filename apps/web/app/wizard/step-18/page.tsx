'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepOutfit } from '../../../components/wizard/steps/StepOutfit';

export default function WizardStep18() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(18);
  }, [setStep]);

  // Only presets flow uses step 18 (Outfit)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepOutfit />;
}
