'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepCreationMethod } from '../../../components/wizard/step-creation-method';

export default function WizardStep0() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(0);
  }, [setStep]);

  return <StepCreationMethod />;
}
