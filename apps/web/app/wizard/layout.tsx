"use client";

import { WizardLayout } from "../../components/wizard/wizard-layout";
import { ProtectedRoute } from "@/components/auth"";

export default function WizardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <WizardLayout>{children}</WizardLayout>
    </ProtectedRoute>
  );
}

