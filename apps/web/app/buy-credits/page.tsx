'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, CreditCard, X, Check, Zap, Sparkles } from 'lucide-react';
import { PageContainer, FadeInUp, RylaButton, cn } from '@ryla/ui';
import { trpc } from '../../lib/trpc';
import { ProtectedRoute } from '../../components/protected-route';
import { CreditPackageCard } from '../../components/pricing';
import { CREDIT_PACKAGES } from '../../constants/pricing';

function BuyCreditsContent() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof CREDIT_PACKAGES[0] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: creditsData, refetch: refetchCredits } = trpc.credits.getBalance.useQuery();

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (packageId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/finby/setup-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'credit',
          packageId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment session');
      }

      const data = await response.json();
      
      // Redirect to Finby payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Failed to start payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePurchaseClick = (packageId: string) => {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;
    await handlePurchase(selectedPackage.id);
  };

  return (
    <PageContainer className="relative">
      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 right-0 h-[500px] w-[500px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-40 left-0 h-[400px] w-[400px] opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Success message */}
      {successMessage && (
        <FadeInUp>
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-emerald-300 font-medium">{successMessage}</p>
            </div>
          </div>
        </FadeInUp>
      )}

      {/* Header */}
      <FadeInUp>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-600)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
              <Sparkles className="h-5 w-5 text-[var(--purple-400)]" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Buy Credits
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            Purchase one-time credit packs to power your AI creations
          </p>
          {creditsData && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <span className="text-sm text-[var(--text-secondary)]">Current balance:</span>
              <span className="text-sm font-semibold text-[var(--purple-400)]">
                {creditsData.balance} credits
              </span>
            </div>
          )}
        </div>
      </FadeInUp>

      {/* Credit packages grid */}
      <FadeInUp delay={100}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {CREDIT_PACKAGES.map((pkg, index) => (
            <div
              key={pkg.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-in fade-in slide-in-from-bottom-2"
            >
              <CreditPackageCard
                package_={pkg}
                onPurchase={handlePurchaseClick}
                isLoading={isProcessing && selectedPackage?.id === pkg.id}
              />
            </div>
          ))}
        </div>
      </FadeInUp>

      {/* Subscription upsell */}
      <FadeInUp delay={200}>
        <div className="max-w-2xl mx-auto mb-8">
          <div className="p-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--purple-500)]/30 transition-all">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-600)]/20 to-[var(--pink-500)]/20">
                <Zap className="h-6 w-6 text-[var(--purple-400)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                  Want monthly credits?
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Subscribe and get credits every month at a better price.
                </p>
              </div>
              <RylaButton asChild variant="glassy-outline" size="default">
                <Link href="/pricing" className="flex items-center gap-2">
                  View Plans
                </Link>
              </RylaButton>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Trust badges */}
      <FadeInUp delay={300}>
        <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-[var(--text-secondary)]">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-[var(--text-secondary)]">Data Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--purple-400)]" />
              <span className="text-sm text-[var(--text-secondary)]">Discreet Billing</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[var(--border-default)]">
              <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-[var(--text-muted)]">Visa</span>
              <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-[var(--text-muted)]">Mastercard</span>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            className={cn(
              'relative w-full max-w-md rounded-2xl',
              'bg-[var(--bg-elevated)] border border-[var(--border-default)]',
              'p-6 sm:p-8 shadow-2xl',
              'animate-in fade-in zoom-in-95 duration-200'
            )}
          >
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-600)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
                <Sparkles className="h-7 w-7 text-[var(--purple-400)]" />
              </div>
              
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Confirm Purchase
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                You're about to purchase credits
              </p>

              {/* Summary card */}
              <div className="p-5 rounded-xl bg-white/5 border border-[var(--border-default)] mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--text-secondary)]">Credits</span>
                  <span className="text-2xl font-bold text-[var(--text-primary)]">{selectedPackage.credits}</span>
                </div>
                <div className="h-px bg-[var(--border-default)] mb-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Total</span>
                  <span className="text-3xl font-extrabold text-[var(--text-primary)]">${selectedPackage.price}</span>
                </div>
              </div>

              {/* Payment notice */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
                <p className="text-blue-300/80 text-xs">
                  You will be redirected to our secure payment page to complete your purchase.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <RylaButton
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  loading={isProcessing}
                  variant="glassy"
                  className="w-full"
                >
                  Continue to Payment
                </RylaButton>
                <RylaButton
                  onClick={() => setShowConfirmModal(false)}
                  variant="ghost"
                  className="w-full text-[var(--text-muted)]"
                >
                  Cancel
                </RylaButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default function BuyCreditsPage() {
  return (
    <ProtectedRoute>
      <BuyCreditsContent />
    </ProtectedRoute>
  );
}
