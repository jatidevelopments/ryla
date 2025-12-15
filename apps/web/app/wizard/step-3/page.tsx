"use client";

import { useEffect } from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { StepFace } from "../../../components/wizard/step-face";

export default function WizardStep3() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  return <StepFace />;
}

