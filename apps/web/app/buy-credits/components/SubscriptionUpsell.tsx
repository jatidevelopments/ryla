'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { FadeInUp, RylaButton } from '@ryla/ui';

export function SubscriptionUpsell() {
  return (
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
  );
}

