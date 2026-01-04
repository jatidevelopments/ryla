'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Login page - redirects to unified auth page
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    const queryString = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
    router.replace(`/auth?mode=login${queryString}`);
  }, [router, searchParams]);

  return null;
}
