import { Suspense } from 'react';
import { PaymentCallbackContent } from './PaymentCallbackContent';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <PaymentCallbackContent />
    </Suspense>
  );
}
