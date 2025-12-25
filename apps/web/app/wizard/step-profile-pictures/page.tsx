'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepProfilePictures } from '../../../components/wizard/step-profile-pictures';

export default function WizardStepProfilePictures() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const steps = useCharacterWizardStore((s) => s.steps);

  useEffect(() => {
    // Find profile pictures step ID
    const profilePicturesStep = steps.find((s) => s.title === 'Profile Pictures');
    if (profilePicturesStep) {
      setStep(profilePicturesStep.id);
    }
  }, [setStep, steps]);

  return <StepProfilePictures />;
}

