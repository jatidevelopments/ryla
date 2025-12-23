'use client';

import { Coins } from 'lucide-react';
import { cn, Button } from '@ryla/ui';
import type { CreditPackage } from '../../constants/pricing';

interface CreditPackageCardProps {
  package_: CreditPackage;
  onPurchase: (packageId: string) => void;
  isLoading?: boolean;
}

// Coin stack visualization based on credit amount
function CoinStack({ credits }: { credits: number }) {
  const stackSize = credits <= 50 ? 1 : credits <= 150 ? 2 : credits <= 350 ? 3 : credits <= 750 ? 4 : 5;
  
  return (
    <div className="relative flex items-end justify-center h-16">
      {Array.from({ length: stackSize }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'absolute w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300 shadow-lg flex items-center justify-center',
            'transform transition-transform'
          )}
          style={{
            bottom: i * 6,
            zIndex: stackSize - i,
            transform: `scale(${1 - i * 0.05})`,
          }}
        >
          {i === 0 && <Coins className="w-5 h-5 text-yellow-900" />}
        </div>
      ))}
    </div>
  );
}

export function CreditPackageCard({
  package_,
  onPurchase,
  isLoading,
}: CreditPackageCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-gradient-to-b from-white/5 to-white/[0.02] p-6 transition-all duration-300 hover:scale-[1.02]',
        package_.highlighted
          ? 'border-purple-500/50 shadow-lg shadow-purple-500/20'
          : 'border-white/10 hover:border-white/20'
      )}
    >
      {/* Badge */}
      {package_.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg whitespace-nowrap">
            {package_.badge}
          </span>
        </div>
      )}

      {/* Coin visualization */}
      <div className="mb-4 pt-2">
        <CoinStack credits={package_.credits} />
      </div>

      {/* Credits amount */}
      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-white">{package_.credits}</span>
        <span className="text-white/60 ml-2">credits</span>
      </div>

      {/* Usage estimate */}
      <p className="text-center text-xs text-white/40 mb-4">
        ~{Math.floor(package_.credits / 5)} draft or ~{Math.floor(package_.credits / 10)} HQ generations
      </p>

      {/* Price */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          {package_.originalPrice && (
            <span className="text-lg text-white/40 line-through">
              ${package_.originalPrice}
            </span>
          )}
          <span className="text-2xl font-bold text-white">
            ${package_.price}
          </span>
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
          'w-full h-11 font-semibold transition-all',
          package_.highlighted
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25'
            : 'bg-white/10 hover:bg-white/20 text-white'
        )}
      >
        {isLoading ? 'Processing...' : 'Buy Credits'}
      </Button>
    </div>
  );
}

