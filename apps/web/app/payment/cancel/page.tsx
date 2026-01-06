'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, ArrowLeft, CreditCard } from 'lucide-react';
import { PageContainer, FadeInUp, RylaButton } from '@ryla/ui';
import { ProtectedRoute } from '../components/auth';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <PageContainer className="flex items-center justify-center min-h-screen">
        <FadeInUp>
          <div className="max-w-md w-full text-center">
            {/* Cancel Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/30">
              <X className="h-10 w-10 text-amber-400" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Payment Cancelled
            </h1>

            {/* Message */}
            <p className="text-[var(--text-secondary)] mb-8">
              Your payment was cancelled. No charges were made to your account.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <RylaButton
                onClick={() => router.back()}
                variant="glassy"
                className="w-full"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </RylaButton>
              
              <RylaButton
                asChild
                variant="ghost"
                className="w-full"
              >
                <Link href="/pricing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Plans
                </Link>
              </RylaButton>
            </div>

            {/* Help */}
            <div className="mt-8 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-muted)]">
                If you experienced any issues during checkout, please try again or contact support for assistance.
              </p>
            </div>
          </div>
        </FadeInUp>
      </PageContainer>
    </ProtectedRoute>
  );
}

