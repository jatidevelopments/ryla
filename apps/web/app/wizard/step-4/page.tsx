'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepBody } from '../../../components/wizard/step-body';
import { StepFinalize } from '../../../components/wizard/step-finalize';

export default function WizardStep4() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  // Render different step based on creation method
  if (creationMethod === 'prompt-based') {
    // Prompt-based: step 4 is finalize
    return <StepFinalize />;
  } else {
    // Presets flow: step 4 is Body
    return <StepBody />;
  }
}
