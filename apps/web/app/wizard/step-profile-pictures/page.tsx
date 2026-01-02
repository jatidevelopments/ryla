'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore } from '@ryla/business';

export default function WizardStepProfilePictures() {
  const router = useRouter();
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const steps = useCharacterWizardStore((s) => s.steps);

  useEffect(() => {
    // Profile pictures are generated after creation on the profile page.
    // If a user lands here (old link), redirect to the current last step.
    const lastStepId = steps.length > 0 ? steps[steps.length - 1].id : 1;
    setStep(lastStepId);
    router.replace(`/wizard/step-${lastStepId}`);
  }, [setStep, steps]);

  return null;
}

