'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Shield, Lock, Check } from 'lucide-react';
import { cn } from '@ryla/ui';
import { trpc } from '../../lib/trpc';
import { PlanCard } from '../../components/pricing';
import { SUBSCRIPTION_PLANS } from '../../constants/pricing';
import { getAccessToken } from '../../lib/auth';

export default function PricingPage() {
  const utils = trpc.useUtils();
  const [isYearly, setIsYearly] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get current subscription
  const { data: subscription, refetch: refetchSubscription } =
    trpc.subscription.getCurrent.useQuery();
  
  // Get current credits to show updated balance
  const { refetch: refetchCredits } = trpc.credits.getBalance.useQuery();

  const currentPlanId = subscription?.tier ?? 'free';

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, yearly: boolean) => {
    if (planId === currentPlanId) return;
    
    setIsProcessing(planId);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('You must be logged in to subscribe');
      }

      const response = await fetch('/api/finby/setup-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'subscription',
          planId: planId as 'starter' | 'pro' | 'unlimited',
          isYearly: yearly,
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
      console.error('Subscription error:', error);
      alert(error.message || 'Failed to start subscription. Please try again.');
      setIsProcessing(null);
    }
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
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Choose Your Plan
        </h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          Unlock the full power of AI influencer creation. Start creating viral content today.
        </p>
        {currentPlanId !== 'free' && (
          <p className="mt-2 text-purple-400 text-sm">
            Current plan: <span className="font-semibold capitalize">{currentPlanId}</span>
          </p>
        )}
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-all',
              !isYearly
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              isYearly
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            )}
          >
            Yearly
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              -40%
            </span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 max-w-5xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isYearly={isYearly}
            isCurrentPlan={currentPlanId === plan.id}
            onSubscribe={handleSubscribe}
            isLoading={isProcessing === plan.id}
          />
        ))}
      </div>

      {/* Buy credits link */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
          <h3 className="font-semibold text-white mb-1">Need more credits?</h3>
          <p className="text-white/60 text-sm mb-3">
            Purchase one-time credit packs for extra credits.
          </p>
          <Link
            href="/buy-credits"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
          >
            <CreditCard className="w-4 h-4" />
            Buy Credit Packs
          </Link>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/10 mb-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-xs text-white/70">Secure Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-400" />
          <span className="text-xs text-white/70">Data Protected</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-400" />
          <span className="text-xs text-white/70">Discreet Billing</span>
        </div>
        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
          <span className="px-2 py-0.5 rounded bg-white/10 text-xs text-white/60">Visa</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-xs text-white/60">MC</span>
        </div>
      </div>

      {/* FAQ section */}
      <div className="max-w-2xl mx-auto pb-8">
        <h2 className="text-lg font-bold text-white text-center mb-4">FAQ</h2>
        <div className="space-y-3">
          <FaqItem
            question="Can I cancel anytime?"
            answer="Yes, cancel anytime. Credits remain until the billing period ends."
          />
          <FaqItem
            question="Do unused credits roll over?"
            answer="Credits reset monthly (use it or lose it policy)."
          />
          <FaqItem
            question="What if I run out of credits?"
            answer="Purchase credit packs or upgrade your plan."
          />
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left flex items-center justify-between gap-4"
      >
        <span className="text-sm font-medium text-white">{question}</span>
        <span className={cn('text-white/50 text-xs transition-transform', isOpen && 'rotate-180')}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-3">
          <p className="text-white/60 text-sm">{answer}</p>
        </div>
      )}
    </div>
  );
}
