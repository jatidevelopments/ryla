'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepBeautyMarks } from '../../../components/wizard/steps/StepBeautyMarks';

export default function WizardStep15() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(15);
  }, [setStep]);

  // Only presets flow uses step 15 (Beauty Marks)
  if (creationMethod !== 'presets') {
    return null;
  }

  return <StepBeautyMarks />;
}
