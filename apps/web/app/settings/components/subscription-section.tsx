'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Label } from '@ryla/ui';
import { routes } from '@/lib/routes';
import { useCredits } from '../../../lib/hooks/use-credits';
import { useSubscription } from '../../../lib/hooks/use-subscription';

export function SubscriptionSection() {
  const { balance, isLoading: isCreditsLoading } = useCredits();
  const {
    tier,
    status: subscriptionStatus,
    isLoading: isSubscriptionLoading,
  } = useSubscription();

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-white">Subscription</h2>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-white">
                {isSubscriptionLoading ? 'Loading...' : `${tier} plan`}
              </Label>
              <span className="rounded-full bg-[var(--text-muted)]/20 px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                {isSubscriptionLoading ? '...' : subscriptionStatus}
              </span>
            </div>
            <p className="text-sm text-white/60">Upgrade for more features</p>
          </div>
          <Link href={routes.pricing}>
            <Button variant="outline" size="sm">
              Upgrade
            </Button>
          </Link>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Credits remaining</span>
            <span className="font-semibold text-white">
              {isCreditsLoading ? '...' : balance.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] opacity-30" />
          </div>
          <div className="mt-3">
            <Link href={routes.buyCredits}>
              <Button variant="outline" size="sm">
                Buy credits
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
