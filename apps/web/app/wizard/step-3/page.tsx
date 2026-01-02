'use client';

import { useEffect } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { StepFace } from '../../../components/wizard/step-face';
import { StepProfilePictures } from '../../../components/wizard/step-profile-pictures';
import { StepFinalize } from '../../../components/wizard/step-finalize';

export default function WizardStep3() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const creationMethod = useCharacterWizardStore((s) => s.form.creationMethod);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // Render different step based on creation method
  if (creationMethod === 'prompt-based') {
    // Prompt-based: step 3 is finalize (profile pictures generate post-create on profile page)
    return <StepFinalize />;
  } else {
    // Presets flow: step 3 is Face
    return <StepFace />;
  }
}
