"use client";

import { useEffect } from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { StepGeneral } from "../../../components/wizard/step-general";

export default function WizardStep2() {
  const setStep = useCharacterWizardStore((s) => s.setStep);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  return <StepGeneral />;
}

