'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepBaseImageSelection } from '../../../components/wizard/step-base-image-selection';

export default function WizardStep6() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  return <StepBaseImageSelection />;
}

