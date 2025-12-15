"use client";

import { useEffect } from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { StepGenerate } from "../../../components/wizard/step-generate";

export default function WizardStep6() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  return <StepGenerate />;
}

