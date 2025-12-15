"use client";

import { useEffect } from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { StepIdentity } from "../../../components/wizard/step-identity";

export default function WizardStep5() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(5);
  }, [setStep]);

  return <StepIdentity />;
}

