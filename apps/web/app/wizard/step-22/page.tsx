'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepFinalize } from '../../../components/wizard/steps/StepFinalize';

export default function WizardStep22() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const _creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(22);
  }, [setStep]);

  // All flows use step 22 for finalize (presets flow)
  return <StepFinalize />;
}
