'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Hook for parsing and accessing studio query parameters
 */
export function useStudioQueryParams() {
  const searchParams = useSearchParams();

  return {
    influencerFromQuery: searchParams.get('influencer'),
    imageIdFromQuery: searchParams.get('imageId'),
    shouldOpenEdit: searchParams.get('edit') === 'true',
  };
}

