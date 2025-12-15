"use client";

import { useEffect } from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { StepBody } from "../../../components/wizard/step-body";

export default function WizardStep4() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  return <StepBody />;
}

