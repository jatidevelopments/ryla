'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepFinalize } from '@/components/wizard/steps/StepFinalize';

export default function WizardStep10() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(10);
  }, [setStep]);

  // All flows use step 10 for finalize
  return <StepFinalize />;
}

