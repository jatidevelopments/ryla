'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Register page - redirects to unified auth page
 */
export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    const queryString = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
    router.replace(`/auth?mode=register${queryString}`);
  }, [router, searchParams]);

  return null;
}
