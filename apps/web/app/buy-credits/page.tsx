'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, CreditCard, X, Check } from 'lucide-react';
import { Button } from '@ryla/ui';
import { trpc } from '../../lib/trpc';
import { CreditPackageCard } from '../../components/pricing';
import { CREDIT_PACKAGES, CREDIT_COSTS } from '../../constants/pricing';

export default function BuyCreditsPage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof CREDIT_PACKAGES[0] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get current credits
  const { data: creditsData, refetch: refetchCredits } = trpc.credits.getBalance.useQuery();

  // Purchase mutation
  const purchaseMutation = trpc.subscription.purchaseCredits.useMutation({
    onSuccess: (data) => {
      // Refetch credits
      refetchCredits();
      
      // Show success message
      setSuccessMessage(
        `🎉 Successfully purchased ${data.creditsPurchased} credits! New balance: ${data.newBalance}`
      );
      
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Close modal
      setShowConfirmModal(false);
      setSelectedPackage(null);
    },
    onError: (error) => {
      console.error('Purchase error:', error);
      alert('Failed to purchase credits. Please try again.');
      setShowConfirmModal(false);
    },
  });

  const handlePurchaseClick = (packageId: string) => {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;
    
    purchaseMutation.mutate({
      packageId: selectedPackage.id,
    });
  };

  return (
    <div className="w-full px-4 py-6 md:px-6 md:py-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-green-300 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Buy Credits
        </h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          Need more credits? Purchase one-time credit packs to fuel your AI creations.
        </p>
        {creditsData && (
          <p className="mt-2 text-purple-400 text-sm">
            Current balance: <span className="font-semibold">{creditsData.balance} credits</span>
          </p>
        )}
      </div>

      {/* Credit cost reference */}
      <div className="flex justify-center gap-6 p-3 rounded-lg bg-white/5 border border-white/10 mb-6 max-w-sm mx-auto">
        <div className="text-center">
          <span className="text-white/50 text-xs">Draft Generation</span>
          <p className="text-white text-sm font-semibold">{CREDIT_COSTS.generation_draft} credits</p>
        </div>
        <div className="w-px bg-white/10" />
        <div className="text-center">
          <span className="text-white/50 text-xs">HQ Generation</span>
          <p className="text-white text-sm font-semibold">{CREDIT_COSTS.generation_hq} credits</p>
        </div>
      </div>

      {/* Credit packages grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
        {CREDIT_PACKAGES.map((pkg) => (
          <CreditPackageCard
            key={pkg.id}
            package_={pkg}
            onPurchase={handlePurchaseClick}
            isLoading={purchaseMutation.isPending && selectedPackage?.id === pkg.id}
          />
        ))}
      </div>

      {/* Subscription upsell */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="p-5 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center">
          <h3 className="font-semibold text-white mb-1">Save more with a subscription</h3>
          <p className="text-white/60 text-sm mb-3">
            Pro plan: 300 credits/month for just $49!
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium transition-all"
          >
            View Plans
          </Link>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/10 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-xs text-white/70">Secure</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-400" />
          <span className="text-xs text-white/70">Protected</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-400" />
          <span className="text-xs text-white/70">Discreet</span>
        </div>
        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
          <span className="px-2 py-0.5 rounded bg-white/10 text-xs text-white/60">Visa</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-xs text-white/60">MC</span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#1a1a2e] border border-white/10 p-5 shadow-2xl">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-3 right-3 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <h2 className="text-xl font-bold text-white mb-2">Confirm Purchase</h2>
              <p className="text-white/60 text-sm mb-4">
                <span className="text-white font-semibold">{selectedPackage.credits} credits</span>
                {' '}for{' '}
                <span className="text-white font-semibold">${selectedPackage.price}</span>
              </p>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-4 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70">Credits</span>
                  <span className="text-white font-medium">{selectedPackage.credits}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Price</span>
                  <span className="text-white font-medium">${selectedPackage.price}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4 text-sm">
                <p className="text-yellow-300 text-xs">
                  🧪 Test Mode: Credits will be added instantly without payment.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleConfirmPurchase}
                  disabled={purchaseMutation.isPending}
                  className="w-full h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                >
                  {purchaseMutation.isPending ? 'Processing...' : 'Confirm & Add Credits'}
                </Button>
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  variant="ghost"
                  className="w-full h-10 text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
