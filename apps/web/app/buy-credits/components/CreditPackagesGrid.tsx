'use client';

import { FadeInUp } from '@ryla/ui';
import { CreditPackageCard } from '../../../components/pricing';
import { CREDIT_PACKAGES } from '../../../constants/pricing';
import type { CreditPackage } from '../../../constants/pricing';

interface CreditPackagesGridProps {
  selectedPackageId: string | null;
  isProcessing: boolean;
  onPurchase: (packageId: string) => void;
}

export function CreditPackagesGrid({
  selectedPackageId,
  isProcessing,
  onPurchase,
}: CreditPackagesGridProps) {
  return (
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
              onPurchase={onPurchase}
              isLoading={isProcessing && selectedPackageId === pkg.id}
            />
          </div>
        ))}
      </div>
    </FadeInUp>
  );
}

