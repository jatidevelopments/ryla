'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { PageContainer, FadeInUp, RylaButton } from '@ryla/ui';
import { ProtectedRoute } from "@/components/auth"';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const type = searchParams.get('type'); // 'subscription' | 'credit'
  const reference = searchParams.get('reference');

  useEffect(() => {
    // Small delay to ensure webhook has processed
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (type === 'subscription') {
      router.push('/pricing');
    } else {
      router.push('/buy-credits');
    }
  };

  return (
    <ProtectedRoute>
      <PageContainer className="flex items-center justify-center min-h-screen">
        <FadeInUp>
          <div className="max-w-md w-full text-center">
            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <Check className="h-10 w-10 text-emerald-400" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Payment Successful!
            </h1>

            {/* Message */}
            <p className="text-[var(--text-secondary)] mb-8">
              {isLoading ? (
                'Processing your payment...'
              ) : type === 'subscription' ? (
                'Your subscription has been activated. Credits have been added to your account.'
              ) : (
                'Your credits have been added to your account and are ready to use.'
              )}
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
                onClick={handleContinue}
                variant="glassy"
                className="w-full"
                size="lg"
              >
                {type === 'subscription' ? 'View Subscription' : 'Buy More Credits'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </RylaButton>
              
              <RylaButton
                asChild
                variant="ghost"
                className="w-full"
              >
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </RylaButton>
            </div>

            {/* Help */}
            <div className="mt-8 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-muted)]">
                If you don't see your credits or subscription, please wait a few moments and refresh the page.
                If the issue persists, contact support.
              </p>
            </div>
          </div>
        </FadeInUp>
      </PageContainer>
    </ProtectedRoute>
  );
}

