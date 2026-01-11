'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Login content - handles redirect
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    const queryString = returnUrl
      ? `?returnUrl=${encodeURIComponent(returnUrl)}`
      : '';
    router.replace(`/auth?mode=login${queryString}`);
  }, [router, searchParams]);

  return null;
}

/**
 * Login page - redirects to unified auth page
 */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
