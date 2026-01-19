'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore } from '@ryla/business';
import { routes } from '@/lib/routes';
import { StepBreastType } from '../../../components/wizard/steps/StepBreastType';

export default function WizardStep12() {
  const router = useRouter();
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);
  const gender = useCharacterWizardStore((s) => s.form.gender);

  useEffect(() => {
    setStep(12);
  }, [setStep]);

  // Only presets flow uses step 12 (Breast Type)
  if (creationMethod !== 'presets') {
    return null;
  }

  // Skip this step for males - redirect to next step
  useEffect(() => {
    if (gender === 'male') {
      router.push(routes.wizard.step13);
    }
  }, [gender, router]);

  // If male, don't render anything (redirect will happen)
  if (gender === 'male') {
    return null;
  }

  return <StepBreastType />;
}
