'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { StudioMode } from '../../../components/studio/generation';

interface UseStudioUrlSyncOptions {
  selectedInfluencerId: string | null;
  selectedImageId: string | null;
  showPanel: boolean;
  mode: StudioMode;
}

interface UrlState {
  influencer: string | null;
  imageId: string | null;
  mode: StudioMode;
  showPanel: boolean;
}

/**
 * Build URL query string from state
 * Pure function - no side effects
 */
function buildQueryString(state: UrlState): string {
  const params = new URLSearchParams();

  if (state.influencer) {
    params.set('influencer', state.influencer);
  }

  // Only add imageId if panel is open
  if (state.imageId && state.showPanel) {
    params.set('imageId', state.imageId);
  }

  // Only add mode if not 'creating' and panel is open with an image
  if (state.mode !== 'creating' && state.showPanel && state.imageId) {
    params.set('mode', state.mode);
  }

  return params.toString();
}

/**
 * Hook for state → URL synchronization
 * Only updates URL when relevant state changes
 */
export function useStudioUrlSync({
  selectedInfluencerId,
  selectedImageId,
  showPanel,
  mode,
}: UseStudioUrlSyncOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Refs for tracking to avoid unnecessary updates
  const lastSyncedRef = React.useRef<string>('');
  const isInitialMount = React.useRef(true);

  // Memoize current URL state
  const currentUrlState = React.useMemo<UrlState>(
    () => ({
      influencer: selectedInfluencerId,
      imageId: selectedImageId,
      mode,
      showPanel,
    }),
    [selectedInfluencerId, selectedImageId, mode, showPanel]
  );

  // Memoize query string
  const queryString = React.useMemo(
    () => buildQueryString(currentUrlState),
    [currentUrlState]
  );

  // Sync state → URL
  React.useEffect(() => {
    // Skip initial mount to allow query params to initialize state first
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Store initial query as last synced
      lastSyncedRef.current = searchParams.toString();
      return;
    }

    // Skip if query hasn't changed
    if (queryString === lastSyncedRef.current) {
      return;
    }

    // Update URL
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
    lastSyncedRef.current = queryString;
  }, [queryString, pathname, router, searchParams]);
}
