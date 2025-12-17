'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepFace } from '../../../components/wizard/step-face';
import { StepAIReview } from '../../../components/wizard/step-ai-review';

export default function WizardStep3() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // Render different step based on creation method
  if (creationMethod === 'ai') {
    return <StepAIReview />;
  } else if (creationMethod === 'custom') {
    // Custom flow goes directly to generate after review (step 2)
    // This shouldn't be reached, but handle it gracefully
    return null;
  } else {
    // Default to presets flow
    return <StepFace />;
  }
}
