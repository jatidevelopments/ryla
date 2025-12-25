'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepProfilePictures } from '../../../components/wizard/step-profile-pictures';

export default function WizardStep7() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(7);
  }, [setStep]);

  return <StepProfilePictures />;
}

