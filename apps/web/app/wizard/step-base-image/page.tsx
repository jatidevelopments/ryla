'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepBaseImageSelection } from '../../../components/wizard/step-base-image-selection';

export default function WizardStepBaseImage() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);
  const steps = useCharacterWizardStore((s) => s.steps);

  useEffect(() => {
    // Find base image step ID (step 6 for presets, step 2 for prompt-based)
    const baseImageStep = steps.find((s) => s.title === 'Base Image');
    if (baseImageStep) {
      setStep(baseImageStep.id);
    }
  }, [setStep, steps]);

  return <StepBaseImageSelection />;
}

