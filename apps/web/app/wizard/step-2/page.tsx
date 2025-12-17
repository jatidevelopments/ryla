'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepGeneral } from '../../../components/wizard/step-general';
import { StepAIGeneration } from '../../../components/wizard/step-ai-generation';
import { StepCustomReview } from '../../../components/wizard/step-custom-review';

export default function WizardStep2() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  // Render different step based on creation method
  if (creationMethod === 'ai') {
    return <StepAIGeneration />;
  } else if (creationMethod === 'custom') {
    return <StepCustomReview />;
  } else {
    // Default to presets flow
    return <StepGeneral />;
  }
}
