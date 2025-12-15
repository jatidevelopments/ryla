"use client";

import { useEffect } from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { StepStyle } from "../../../components/wizard/step-style";

export default function WizardStep1() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  return <StepStyle />;
}

