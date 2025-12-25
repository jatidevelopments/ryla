'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepGeneral } from '../../../components/wizard/step-general';
import { StepBaseImageSelection } from '../../../components/wizard/step-base-image-selection';

export default function WizardStep2() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  // Render different step based on creation method
  if (creationMethod === 'prompt-based') {
    // Prompt-based: step 2 is base image selection
    return <StepBaseImageSelection />;
  } else {
    // Presets flow: step 2 is General
    return <StepGeneral />;
  }
}
