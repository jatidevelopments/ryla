'use client';

import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import { cn, Button } from '@ryla/ui';
import type { SubscriptionPlan } from '@ryla/shared';
import { FEATURE_CREDITS } from '@ryla/shared';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isYearly: boolean;
  isCurrentPlan?: boolean;
  onSubscribe: (planId: string, isYearly: boolean) => void;
  isLoading?: boolean;
}

const PlanIcon = ({ planId }: { planId: string }) => {
  switch (planId) {
    case 'starter':
      return <Zap className="w-5 h-5 text-purple-400" />;
    case 'pro':
      return <Sparkles className="w-5 h-5 text-pink-400" />;
    case 'unlimited':
      return <Crown className="w-5 h-5 text-yellow-400" />;
    default:
      return <Zap className="w-5 h-5 text-purple-400" />;
  }
};

export function PlanCard({
  plan,
  isYearly,
  isCurrentPlan,
  onSubscribe,
  isLoading,
}: PlanCardProps) {
  const price = isYearly ? plan.priceYearlyPerMonth : plan.priceMonthly;
  const totalYearly = plan.priceYearly;
  const monthlySavings = isYearly
    ? Math.round(((plan.priceMonthly * 12 - plan.priceYearly) / (plan.priceMonthly * 12)) * 100)
    : 0;

  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-gradient-to-b from-white/5 to-white/[0.02] p-6 transition-all duration-300',
        plan.highlighted
          ? 'border-purple-500/50 shadow-lg shadow-purple-500/20 scale-[1.02]'
          : 'border-white/10 hover:border-white/20'
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <PlanIcon planId={plan.id} />
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        </div>
        <p className="text-sm text-white/60">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold text-white">
            ${price.toFixed(2)}
          </span>
          <span className="text-white/50 mb-1">/mo</span>
        </div>
        {isYearly && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-white/50">
              ${totalYearly} billed annually
            </p>
            {monthlySavings > 0 && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                Save {monthlySavings}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Credits */}
      <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Monthly Credits</span>
          <span className="text-xl font-bold text-white">
            {plan.monthlyCredits === Infinity ? '∞' : plan.monthlyCredits}
          </span>
        </div>
        {plan.monthlyCredits !== Infinity && (
          <p className="text-xs text-white/40 mt-1">
            ~{Math.floor(plan.monthlyCredits / FEATURE_CREDITS.studio_fast.credits)} quick or ~{Math.floor(plan.monthlyCredits / FEATURE_CREDITS.studio_standard.credits)} HQ generations
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <span className="text-sm text-white/80">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={() => onSubscribe(plan.id, isYearly)}
        disabled={isCurrentPlan || isLoading}
        className={cn(
          'w-full h-12 font-semibold transition-all',
          plan.highlighted
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25'
            : 'bg-white/10 hover:bg-white/20 text-white'
        )}
      >
        {isCurrentPlan ? 'Current Plan' : isLoading ? 'Processing...' : 'Subscribe'}
      </Button>
    </div>
  );
}

