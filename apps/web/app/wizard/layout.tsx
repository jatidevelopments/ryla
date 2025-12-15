"use client";

import { WizardLayout } from "../../components/wizard/wizard-layout";

export default function WizardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WizardLayout>{children}</WizardLayout>;
}

