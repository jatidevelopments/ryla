'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { PageContainer, FadeInUp, RylaButton } from '@ryla/ui';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');

  return (
    <ProtectedRoute>
      <PageContainer className="flex items-center justify-center min-h-screen">
        <FadeInUp>
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Payment Error
            </h1>

            {/* Message */}
            <p className="text-[var(--text-secondary)] mb-8">
              We encountered an error processing your payment. Please try again or contact support if the problem persists.
            </p>

            {/* Reference */}
            {reference && (
              <div className="mb-8 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">Payment Reference</p>
                <p className="text-sm font-mono text-[var(--text-secondary)]">{reference}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <RylaButton
                onClick={() => router.back()}
                variant="glassy"
                className="w-full"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </RylaButton>
              
              <RylaButton
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Dashboard
              </RylaButton>
            </div>

            {/* Help */}
            <div className="mt-8 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                Common issues:
              </p>
              <ul className="text-xs text-[var(--text-muted)] text-left space-y-1">
                <li>• Insufficient funds</li>
                <li>• Card declined by bank</li>
                <li>• Network connectivity issues</li>
              </ul>
              <p className="text-xs text-[var(--text-muted)] mt-4">
                If you need assistance, please contact support with your payment reference.
              </p>
            </div>
          </div>
        </FadeInUp>
      </PageContainer>
    </ProtectedRoute>
  );
}

