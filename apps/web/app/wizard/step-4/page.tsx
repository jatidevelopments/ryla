'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepBody } from '../../../components/wizard/step-body';
import { StepGenerate } from '../../../components/wizard/step-generate';

export default function WizardStep4() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  // For AI and Custom flows, step 4 is the generate step
  if (creationMethod === 'ai' || creationMethod === 'custom') {
    return <StepGenerate />;
  }

  // Default to presets flow
  return <StepBody />;
}
