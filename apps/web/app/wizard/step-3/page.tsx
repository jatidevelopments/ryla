'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepFace } from '../../../components/wizard/step-face';
import { StepBaseImageSelection } from '../../../components/wizard/step-base-image-selection';

export default function WizardStep3() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // For prompt-based flow, step 3 is Base Image Selection
  if (creationMethod === 'prompt-based') {
    return <StepBaseImageSelection />;
  }

  // For presets flow, step 3 is Facial Features
  if (creationMethod === 'presets') {
    return <StepFace />;
  }

  // Fallback: if no creation method selected, return null
  return null;
}
