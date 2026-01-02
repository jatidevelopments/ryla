'use client';

import { Sparkles } from 'lucide-react';
import { cn, Button } from '@ryla/ui';
import type { CreditPackage } from '../../constants/pricing';

interface CreditPackageCardProps {
  package_: CreditPackage;
  onPurchase: (packageId: string) => void;
  isLoading?: boolean;
}

export function CreditPackageCard({
  package_,
  onPurchase,
  isLoading,
}: CreditPackageCardProps) {
  const isHighlighted = package_.highlighted;
  
  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-gradient-to-b from-white/5 to-white/[0.02] p-5 transition-all duration-300',
        isHighlighted
          ? 'border-purple-500/50 shadow-lg shadow-purple-500/20 scale-[1.02]'
          : 'border-white/10 hover:border-white/20'
      )}
    >
      {/* Badge */}
      {package_.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg whitespace-nowrap">
            {package_.badge}
          </span>
        </div>
      )}

      {/* Credits */}
      <div className="text-center mb-4 pt-2">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-white">{package_.credits}</span>
          <span className="text-white/50 text-sm">credits</span>
        </div>
      </div>

      {/* Price */}
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-2">
          {package_.originalPrice && (
            <span className="text-white/40 text-lg line-through">${package_.originalPrice}</span>
          )}
          <span className="text-2xl font-bold text-white">${package_.price}</span>
        </div>
        {package_.savePercent && (
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            Save {package_.savePercent}%
          </span>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={() => onPurchase(package_.id)}
        disabled={isLoading}
        className={cn(
          'w-full h-10 font-semibold transition-all text-sm',
          isHighlighted
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25'
            : 'bg-white/10 hover:bg-white/20 text-white'
        )}
      >
        {isLoading ? 'Processing...' : 'Buy Credits'}
      </Button>
    </div>
  );
}
