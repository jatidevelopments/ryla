'use client';

import { useState } from 'react';
import { Shield, Lock, CreditCard, Check, Sparkles } from 'lucide-react';
import { PageContainer, FadeInUp } from '@ryla/ui';
import { trpc } from '../../lib/trpc';
import { ProtectedRoute } from '../components/auth';
import { CREDIT_PACKAGES, type CreditPackage } from '../../constants/pricing';
import { useCreditPurchase } from './hooks';
import {
  PurchaseConfirmationModal,
  CreditPackagesGrid,
  SubscriptionUpsell,
} from './components';

function BuyCreditsContent() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: creditsData } = trpc.credits.getBalance.useQuery();

  const { purchase, isProcessing } = useCreditPurchase({
    onError: (error) => {
      alert(error.message || 'Failed to start payment. Please try again.');
    },
  });

  const handlePurchaseClick = (packageId: string) => {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;
    try {
      await purchase(selectedPackage.id);
    } catch {
      // Error handled by hook's onError callback
    }
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
      <CreditPackagesGrid
        selectedPackageId={selectedPackage?.id ?? null}
        isProcessing={isProcessing}
        onPurchase={handlePurchaseClick}
      />

      {/* Subscription upsell */}
      <SubscriptionUpsell />

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
        <PurchaseConfirmationModal
          package_={selectedPackage}
          isProcessing={isProcessing}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setShowConfirmModal(false)}
        />
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
