'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepFinalize } from '../../../components/wizard/step-finalize';

export default function WizardStep8() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(8);
  }, [setStep]);

  return <StepFinalize />;
}

