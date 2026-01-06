'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepSkinFeatures } from '../../../components/wizard/steps/StepSkinFeatures';

export default function WizardStep6() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  // Only presets flow uses step 6 (Skin Features)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepSkinFeatures />;
}
